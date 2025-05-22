
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
    console.log("Function triggered: send-invitation");
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, invitation_id, invitation_type, base_url } = await req.json();
    
    if (!invitation_id || !invitation_type) {
      throw new Error("Missing required parameters");
    }

    console.log(`Processing invitation: ${invitation_id} of type ${invitation_type}`);
    
    const tableName = invitation_type === 'tenant' ? 'tenant_invitations' : 'service_provider_invitations';
    
    // Get invitation details
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
    
    // Get property name
    const { data: property } = await supabaseClient
      .from('properties')
      .select('name')
      .eq('id', invitation.property_id)
      .single();
      
    const propertyName = property?.name || "the property";

    // Ensure the base_url is properly formatted (remove trailing slash if present)
    const formattedBaseUrl = base_url.endsWith('/') ? base_url.slice(0, -1) : base_url;
    
    // Create invitation URL - using the path that matches our route in App.tsx
    const invitationUrl = `${formattedBaseUrl}/auth/accept-invitation?token=${invitation.link_token}&email=${encodeURIComponent(invitation.email)}`;
    
    console.log(`Generated invitation URL: ${invitationUrl}`);
    
    // Try to send email via Supabase Auth OTP
    try {
      const { data, error: otpError } = await supabaseClient.auth.admin.generateLink({
        type: 'magiclink',
        email: invitation.email,
        options: {
          redirectTo: invitationUrl,
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
        // Continue to return the invitation URL even if email fails
      } else {
        console.log("Magic link generated successfully");
      }
      
      return new Response(
        JSON.stringify({ 
          success: true,
          email_sent: !otpError,
          magic_link: invitationUrl
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      
      // Return success with the URL even if email fails
      return new Response(
        JSON.stringify({ 
          success: true,
          email_sent: false,
          magic_link: invitationUrl
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
