
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Function triggered: send-invitation");
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestBody = await req.json();
    const { action, invitation_id, invitation_type, base_url } = requestBody;
    
    if (!invitation_id || typeof invitation_id !== 'string') {
      throw new Error("Invalid invitation_id parameter");
    }
    
    if (!invitation_type || !['tenant', 'service_provider'].includes(invitation_type)) {
      throw new Error("Invalid invitation_type parameter");
    }
    
    if (!base_url || typeof base_url !== 'string' || !base_url.startsWith('http')) {
      throw new Error("Invalid base_url parameter");
    }

    console.log(`Processing invitation: ${invitation_id} of type ${invitation_type}`);
    
    const tableName = invitation_type === 'tenant' ? 'tenant_invitations' : 'service_provider_invitations';
    
    console.log(`Fetching invitation with ID: ${invitation_id} from table: ${tableName}`);
    const { data: invitation, error: fetchError } = await supabaseClient
      .from(tableName)
      .select('id, email, property_id, link_token')
      .eq('id', invitation_id)
      .single();

    if (fetchError || !invitation) {
      console.error("Error fetching invitation:", fetchError);
      throw fetchError || new Error("Invitation not found");
    }

    console.log(`Found invitation for email: ${invitation.email}`);
    
    const { data: property } = await supabaseClient
      .from('properties')
      .select('name')
      .eq('id', invitation.property_id)
      .single();
      
    const propertyName = property?.name || "the property";

    const formattedBaseUrl = base_url.endsWith('/') ? base_url.slice(0, -1) : base_url;
    const primaryInvitationUrl = `${formattedBaseUrl}/auth/accept-invitation?token=${invitation.link_token}&email=${encodeURIComponent(invitation.email)}`;
    
    console.log(`Generated invitation URL: ${primaryInvitationUrl}`);
    
    try {
      const { data, error: otpError } = await supabaseClient.auth.admin.generateLink({
        type: 'magiclink',
        email: invitation.email,
        options: {
          redirectTo: primaryInvitationUrl,
          data: {
            invitation_id: invitation.id,
            property_id: invitation.property_id,
            type: invitation_type,
            property_name: propertyName
          }
        }
      });

      if (otpError) {
        console.error("Error generating OTP link:", otpError);
      } else {
        console.log("Magic link generated successfully");
      }
      
      return new Response(
        JSON.stringify({ 
          success: true,
          email_sent: !otpError,
          magic_link: primaryInvitationUrl
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      
      return new Response(
        JSON.stringify({ 
          success: true,
          email_sent: false,
          magic_link: primaryInvitationUrl
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
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
