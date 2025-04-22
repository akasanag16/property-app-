
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, invitation_id, invitation_type, base_url } = await req.json();
    
    if (!invitation_id || !invitation_type) {
      throw new Error("Missing required parameters");
    }

    const tableName = invitation_type === 'tenant' ? 'tenant_invitations' : 'service_provider_invitations';
    
    // Get invitation details
    console.log(`Fetching invitation with ID: ${invitation_id} from table: ${tableName}`);
    const { data: invitation, error: fetchError } = await supabaseClient
      .from(tableName)
      .select('id, email, property_id')
      .eq('id', invitation_id)
      .single();

    if (fetchError || !invitation) {
      console.error("Error fetching invitation:", fetchError);
      throw fetchError || new Error("Invitation not found");
    }

    console.log(`Found invitation for email: ${invitation.email}`);
    
    // Get property name
    const { data: property } = await supabaseClient
      .from('properties')
      .select('name')
      .eq('id', invitation.property_id)
      .single();
      
    const propertyName = property?.name || "the property";

    // Create magic link using Supabase Auth OTP
    const { data, error: otpError } = await supabaseClient.auth.admin.generateLink({
      type: 'magiclink',
      email: invitation.email,
      options: {
        redirectTo: `${base_url}/invitation/accept?token=${invitation.id}&type=${invitation_type}`,
        data: {
          invitation_id: invitation.id,
          property_id: invitation.property_id,
          type: invitation_type
        }
      }
    });

    if (otpError) {
      console.error("Error generating OTP link:", otpError);
      throw otpError;
    }

    console.log("Magic link generated successfully");
    
    return new Response(
      JSON.stringify({ 
        success: true,
        email_sent: true,
        magic_link: data.properties.action_link
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
