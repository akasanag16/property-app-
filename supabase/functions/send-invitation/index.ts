
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendEmail(to: string, subject: string, body: string) {
  try {
    console.log(`Attempting to send email to ${to} with subject: ${subject}`);
    
    // Check if API key is available
    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      console.warn("RESEND_API_KEY is not set or empty");
      return { success: false, error: "Missing API key" };
    }
    
    // For debugging
    console.log(`API key available: ${apiKey ? 'Yes (length: ' + apiKey.length + ')' : 'No'}`);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'Property Management <noreply@lovable.app>',
        to: [to],
        subject: subject,
        html: body
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error(`Email API error (${response.status}):`, result);
      return { success: false, error: `Email sending failed: ${JSON.stringify(result)}` };
    }
    
    console.log("Email sent successfully:", result);
    return { success: true, result };
  } catch (error) {
    console.error("Error in sendEmail function:", error);
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
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
    
    // Get invitation details using the service role key to bypass RLS
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
    
    // Get property name using a separate query with service role to bypass RLS
    const { data: property, error: propertyError } = await supabaseClient
      .from('properties')
      .select('name')
      .eq('id', invitation.property_id)
      .single();
      
    if (propertyError) {
      console.error("Error fetching property:", propertyError);
      // Continue with a generic property name
    }
    
    const propertyName = property?.name || "the property";
    console.log(`Property name: ${propertyName}`);
    
    // Create invitation URL
    const appBaseUrl = base_url || 'https://prop-link-manage.lovable.app';
    const inviteUrl = `${appBaseUrl}/auth/accept-invitation?token=${invitation.link_token}&email=${encodeURIComponent(invitation.email)}`;
    
    console.log(`Generated invitation URL: ${inviteUrl}`);
    
    // Prepare email content based on invitation type
    const roleText = invitation_type === 'tenant' ? 'tenant' : 'service provider';
    const subject = `Invitation to join ${propertyName} as a ${roleText}`;
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You've been invited!</h2>
        <p>You have been invited to join <strong>${propertyName}</strong> as a <strong>${roleText}</strong>.</p>
        <p>Click the link below to accept the invitation and create your account:</p>
        <p>
          <a href="${inviteUrl}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
            Accept Invitation
          </a>
        </p>
        <p>Or copy and paste this URL into your browser:</p>
        <p>${inviteUrl}</p>
        <p>This invitation will expire in 7 days.</p>
        <p>If you did not expect this invitation, you can safely ignore this email.</p>
      </div>
    `;
    
    // Send the email
    console.log(`Sending email to ${invitation.email}`);
    const emailResult = await sendEmail(invitation.email, subject, emailBody);
    
    if (!emailResult.success) {
      console.error(`Failed to send email:`, emailResult.error);
      // Even if email fails, return the invitation URL
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Failed to send email: ${emailResult.error}`,
          invitation_url: inviteUrl 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    console.log(`Email sent successfully to ${invitation.email}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation email sent successfully',
        invitation_url: inviteUrl 
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
