
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );
    
    // Check if this is a scheduled invocation
    const { scheduled } = await req.json();
    
    if (scheduled) {
      // Process rent notifications
      const { data: notificationsProcessed, error: notificationsError } = await supabaseClient.rpc(
        'process_rent_notifications'
      );
      
      if (notificationsError) {
        console.error('Error processing rent notifications:', notificationsError);
        return new Response(
          JSON.stringify({ error: 'Failed to process rent notifications' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      // Generate rent reminder instances
      const { data: instancesGenerated, error: generationError } = await supabaseClient.rpc(
        'process_rent_reminder_generation'
      );
      
      if (generationError) {
        console.error('Error generating rent reminder instances:', generationError);
        return new Response(
          JSON.stringify({ error: 'Failed to generate rent reminder instances' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          notificationsProcessed,
          instancesGenerated
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ message: 'This function is designed to be called on a schedule.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error processing rent function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
