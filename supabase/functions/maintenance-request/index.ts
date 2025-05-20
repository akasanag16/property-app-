
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
    
    // First verify tenant has access to this property using our security function
    const { data: hasAccess, error: accessCheckError } = await supabaseClient
      .rpc('check_tenant_property_access', {
        tenant_id_param: tenant_id,
        property_id_param: property_id
      });
    
    if (accessCheckError) {
      console.error('Error checking property access:', accessCheckError);
      throw new Error(`Access verification failed: ${accessCheckError.message}`);
    }
    
    if (!hasAccess) {
      return new Response(
        JSON.stringify({ 
          error: 'Tenant does not have access to this property'
        }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
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
      throw insertError;
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
        error: error.message || 'Unknown error occurred',
        stack: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
