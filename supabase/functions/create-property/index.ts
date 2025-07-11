
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
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    let requestData;
    
    // If it's a POST request, parse the request body
    if (req.method === "POST") {
      requestData = await req.json();
      
      // Handle the "fetch" action in POST requests
      if (requestData.action === "fetch") {
        const ownerId = requestData.owner_id;
        
        if (!ownerId) {
          return new Response(
            JSON.stringify({ error: "Missing owner_id parameter" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Fetch properties
        const { data, error } = await supabase
          .from("properties")
          .select(`
            id, 
            name, 
            address, 
            details,
            property_images (
              id,
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
        
        // Transform data to include the primary image URL directly
        const transformedData = data.map(property => {
          const primaryImage = property.property_images?.find(img => img.is_primary);
          return {
            ...property,
            image_url: primaryImage?.url || null
          };
        });
        
        return new Response(
          JSON.stringify(transformedData),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Handle property creation
      const { name, address, owner_id, details } = requestData;
      
      if (!name || !address || !owner_id) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

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
