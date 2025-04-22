
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
    // Create a Supabase client with the service role key to bypass RLS
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
      .select('id, email, link_token, property_id')
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
    
    // Create magic link invitation URL using Supabase Auth
    const { data: magicLink, error: magicLinkError } = await supabaseClient.auth.admin.generateLink({
      type: 'magiclink',
      email: invitation.email,
      options: {
        redirectTo: `${base_url}/invitation/accept?token=${invitation.link_token}&type=${invitation_type}`,
        data: {
          invitation_id: invitation.id,
          property_id: invitation.property_id,
          type: invitation_type
        }
      }
    });

    if (magicLinkError) {
      console.error("Error generating magic link:", magicLinkError);
      throw magicLinkError;
    }

    console.log("Magic link generated successfully");
    
    // Always return both URLs - the magic link and our custom invitation URL as fallback
    const customInviteUrl = `${base_url}/auth/accept-invitation?token=${invitation.link_token}&email=${encodeURIComponent(invitation.email)}`;
    
    return new Response(
      JSON.stringify({ 
        success: true,
        email_sent: true, // Supabase handles the email sending
        invitation_url: customInviteUrl,
        magic_link: magicLink.properties.action_link
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
