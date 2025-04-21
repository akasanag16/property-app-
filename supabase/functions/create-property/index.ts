
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Set up CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body - either JSON or URL parameters
    let requestData;
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    
    // If it's a GET request with action=fetch, we're fetching properties
    if (req.method === "GET" && action === "fetch") {
      const ownerId = url.searchParams.get("owner_id");
      
      if (!ownerId) {
        return new Response(
          JSON.stringify({ error: "Missing owner_id parameter" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Create Supabase client
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Fetch properties
      const { data, error } = await supabase
        .from("properties")
        .select(`
          id, 
          name, 
          address, 
          details,
          property_images (
            url,
            is_primary
          )
        `)
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching properties:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify(data),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } 
    // If it's a POST request, we're creating a property
    else if (req.method === "POST") {
      // Get the request body
      const { name, address, owner_id, details } = await req.json();
      
      console.log("Creating property:", { name, address, owner_id });

      if (!name || !address || !owner_id) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create Supabase client with admin key (bypasses RLS)
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Insert property directly with admin privileges
      const { data, error } = await supabase
        .from("properties")
        .insert({
          name,
          address,
          owner_id,
          details
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating property:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Return the created property data
      return new Response(
        JSON.stringify(data),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
