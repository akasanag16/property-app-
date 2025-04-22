
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@1.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const SUPABASE_URL = "https://smooniqpqenxdbkceppn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtb29uaXFwcWVueGRia2NlcHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNjI0ODUsImV4cCI6MjA2MDgzODQ4NX0.MhwwE_baKbSuSM8yHUxgREWGwOxEHhW05RygLy3xHBw";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  notification_id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();
    console.log('Received notification payload:', payload);

    // Get the user's email using their user_id
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('email')
      .eq('id', payload.user_id)
      .single();

    if (userError) {
      console.error('Error fetching user email:', userError);
      throw new Error(`Failed to fetch user email: ${userError.message}`);
    }

    if (!userData || !userData.email) {
      throw new Error('User email not found');
    }

    const userEmail = userData.email;
    console.log(`Found user email: ${userEmail} for user_id: ${payload.user_id}`);

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Property Management <onboarding@resend.dev>',
      to: [userEmail],
      subject: payload.title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">${payload.title}</h2>
          <p style="color: #555; font-size: 16px;">${payload.message}</p>
          <p style="color: #777; font-size: 14px;">Notification Type: ${payload.type}</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">This is an automated message from the Property Management System.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    console.log('Email sent successfully:', data);

    return new Response(JSON.stringify({ success: true, email: userEmail }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in send-notification-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
