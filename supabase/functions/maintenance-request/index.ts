
// Follow this setup guide to integrate the Deno runtime and Supabase functions in your project:
// https://docs.supabase.com/guides/functions/getting-started

import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
export const options = async (req: Request) => {
  return new Response(null, {
    headers: corsHeaders,
    status: 200
  });
};

export const handler = async (req: Request) => {
  // Handle CORS options request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if the request is valid
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
      );
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Get request body
    const body = await req.json();
    const { title, description, property_id, tenant_id, status = 'pending' } = body;
    
    // Validate required fields
    if (!title || !description || !property_id || !tenant_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields", success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log("Creating maintenance request for tenant:", tenant_id, "on property:", property_id);

    // Get secret keys from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

    // Initialize Supabase client with the JWT from authorization header
    const token = authHeader.split(' ')[1];
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // Get user from authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Authentication error:", userError);
      return new Response(
        JSON.stringify({ error: "Authentication error", details: userError?.message, success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    console.log("Authenticated as user:", user.id);
    
    // Check if the tenant ID in the request matches the authenticated user
    if (user.id !== tenant_id) {
      return new Response(
        JSON.stringify({ error: "User ID does not match tenant ID", success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }
    
    // Verify tenant has access to this property
    const { data: linkData, error: linkError } = await supabase
      .from('tenant_property_link')
      .select('id')
      .eq('tenant_id', tenant_id)
      .eq('property_id', property_id)
      .maybeSingle();
      
    if (linkError) {
      console.error("Error checking tenant access:", linkError);
      return new Response(
        JSON.stringify({ error: "Error verifying tenant access to property", success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    if (!linkData) {
      return new Response(
        JSON.stringify({ error: "Tenant does not have access to this property", success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }
    
    // All checks pass, create the maintenance request
    const { data: requestData, error: requestError } = await supabase
      .from('maintenance_requests')
      .insert({
        title,
        description,
        property_id,
        tenant_id,
        status
      })
      .select('id')
      .single();
      
    if (requestError) {
      console.error("Error creating maintenance request:", requestError);
      return new Response(
        JSON.stringify({ error: requestError.message, success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    console.log("Maintenance request created:", requestData.id);
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        message: "Maintenance request created successfully", 
        id: requestData.id,
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message, success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
};
