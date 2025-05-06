
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
      { global: { headers: { Authorization: authHeader } } }
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
    
    // Insert the maintenance request directly
    const { data, error } = await supabaseClient
      .from('maintenance_requests')
      .insert({
        title,
        description,
        property_id,
        tenant_id,
        status
      })
      .select('id')
      .single()
    
    if (error) {
      console.error('Error inserting maintenance request:', error);
      throw error;
    }
    
    // Return success with the new request ID
    return new Response(
      JSON.stringify({ success: true, id: data.id }),
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
