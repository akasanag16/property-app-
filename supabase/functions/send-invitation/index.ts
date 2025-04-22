
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// For email sending, we'll use a simple fetch to a mock service
// In production, replace this with a real email service like Resend, SendGrid, etc.
async function sendEmail(to: string, subject: string, body: string) {
  try {
    console.log(`Sending email to ${to} with subject: ${subject}`);
    console.log(`Email body: ${body}`);
    
    // For demo purposes, we're just logging the email
    // In a real implementation, you'd use an email service API
    
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { action, invitation_id, invitation_type, base_url } = await req.json();
    
    if (!invitation_id || !invitation_type) {
      throw new Error("Missing required parameters");
    }

    const tableName = invitation_type === 'tenant' ? 'tenant_invitations' : 'service_provider_invitations';
    
    // Get invitation details
    const { data: invitation, error: fetchError } = await supabaseClient
      .from(tableName)
      .select(`
        id, 
        email, 
        link_token, 
        property_id, 
        properties:property_id (
          name, 
          address
        )
      `)
      .eq('id', invitation_id)
      .single();

    if (fetchError || !invitation) {
      console.error("Error fetching invitation:", fetchError);
      throw fetchError || new Error("Invitation not found");
    }

    // Get property details for better email context
    const propertyName = invitation.properties?.name || "the property";
    
    // Create invitation URL
    const inviteUrl = `${base_url || 'https://themanageproperty.app'}/auth/accept-invitation?token=${invitation.link_token}&email=${encodeURIComponent(invitation.email)}`;
    
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
    const emailResult = await sendEmail(invitation.email, subject, emailBody);
    
    if (!emailResult.success) {
      throw new Error(`Failed to send email: ${emailResult.error}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation email sent successfully',
        invitation_url: inviteUrl // Return URL for testing purposes
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
