
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the request body
    const requestData = await req.json()
    
    // Create a Supabase client with the Auth context of the user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize the Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { 
        global: { 
          headers: { Authorization: authHeader } 
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Get the current user ID
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      console.error('Error getting authenticated user:', userError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed', details: userError?.message }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    console.log(`User authenticated: ${user.id}`);
    
    // Validate required fields
    const { title, description, property_id, tenant_id, status = 'pending' } = requestData
    if (!title || !description || !property_id || !tenant_id) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          details: { title, description, property_id, tenant_id }
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Check user role
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      console.error('Error fetching user role:', profileError);
      return new Response(
        JSON.stringify({ 
          error: 'Could not determine user role',
          details: profileError.message
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    const userRole = profileData?.role;
    console.log(`User role: ${userRole}`);
    
    // Different roles require different permission checks
    let hasAccess = false;
    
    if (userRole === 'tenant') {
      // For tenant role, verify they have access to this property and are the tenant in question
      if (user.id !== tenant_id) {
        return new Response(
          JSON.stringify({ 
            error: 'Tenant ID mismatch with authenticated user'
          }),
          { 
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      // Use our safe RPC function to check access
      const { data: accessData, error: accessError } = await supabaseClient
        .rpc('safe_check_tenant_property_access', {
          tenant_id_param: tenant_id,
          property_id_param: property_id
        });
      
      if (accessError) {
        console.error('Error checking property access:', accessError);
        return new Response(
          JSON.stringify({ 
            error: 'Access check failed',
            details: accessError.message
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      hasAccess = accessData === true;
    } else if (userRole === 'owner') {
      // For owner role, verify they own this property
      const { data: ownerAccessData, error: ownerAccessError } = await supabaseClient
        .rpc('safe_is_owner_of_property', {
          user_id_param: user.id,
          property_id_param: property_id
        });
      
      if (ownerAccessError) {
        console.error('Error checking owner access:', ownerAccessError);
        return new Response(
          JSON.stringify({ 
            error: 'Owner access check failed',
            details: ownerAccessError.message
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      hasAccess = ownerAccessData === true;
    } else {
      // For other roles (e.g. service_provider), deny access for now
      hasAccess = false;
    }
    
    if (!hasAccess) {
      return new Response(
        JSON.stringify({ 
          error: `User does not have permission to create maintenance requests for this property`,
          details: { role: userRole }
        }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    console.log('Access verified, creating maintenance request');
    
    // Use the secure RPC function to create the maintenance request
    const { data: requestId, error: insertError } = await supabaseClient
      .rpc('create_maintenance_request', {
        title_param: title,
        description_param: description,
        property_id_param: property_id,
        tenant_id_param: tenant_id,
        status_param: status
      });
    
    if (insertError) {
      console.error('Error creating maintenance request:', insertError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create maintenance request',
          details: insertError.message
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Return success with the new request ID
    return new Response(
      JSON.stringify({ success: true, id: requestId }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error in maintenance-request function:', error);
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
