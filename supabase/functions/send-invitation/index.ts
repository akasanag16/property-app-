import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendEmail(to: string, subject: string, body: string) {
  try {
    console.log(`Sending email to ${to} with subject: ${subject}`);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`
      },
      body: JSON.stringify({
        from: 'Property Management <onboarding@prop-link-manage.lovable.app>',
        to: [to],
        subject: subject,
        html: body
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`Email sending failed: ${JSON.stringify(result)}`);
    }
    
    return { success: true, result };
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
    
    // Get invitation details - using a simple query to avoid recursion issues
    const { data: invitation, error: fetchError } = await supabaseClient
      .from(tableName)
      .select('id, email, link_token, property_id')
      .eq('id', invitation_id)
      .single();

    if (fetchError || !invitation) {
      console.error("Error fetching invitation:", fetchError);
      throw fetchError || new Error("Invitation not found");
    }

    // Get property name using a separate query to avoid the recursion
    const { data: property, error: propertyError } = await supabaseClient
      .from('properties')
      .select('name')
      .eq('id', invitation.property_id)
      .single();
      
    if (propertyError) {
      console.error("Error fetching property:", propertyError);
      // Continue with a generic property name
    }
    
    // Create invitation URL
    const propertyName = property?.name || "the property";
    const inviteUrl = `${base_url || 'https://prop-link-manage.lovable.app'}/auth/accept-invitation?token=${invitation.link_token}&email=${encodeURIComponent(invitation.email)}`;
    
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
