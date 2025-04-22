
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    const { action, invitation_id, invitation_type, token, email } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Handle token validation
    if (action === 'validateToken') {
      if (!token || !email) {
        throw new Error("Missing token or email")
      }

      // Check both tenant and service provider invitation tables
      const tablesToCheck = ['tenant_invitations', 'service_provider_invitations']
      let validInvitation = null
      let propertyId = null
      let role = null

      for (const table of tablesToCheck) {
        const { data, error } = await supabaseClient
          .from(table)
          .select('*')
          .eq('link_token', token)
          .eq('email', email)
          .eq('is_used', false)
          .gt('expires_at', new Date().toISOString())
          .maybeSingle()

        if (error) throw error
        
        if (data) {
          validInvitation = data
          propertyId = data.property_id
          role = table === 'tenant_invitations' ? 'tenant' : 'service_provider'
          break
        }
      }

      if (!validInvitation) {
        return new Response(
          JSON.stringify({ valid: false, message: "Invalid or expired invitation" }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          valid: true, 
          propertyId, 
          role,
          invitationId: validInvitation.id
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }
    
    // Handle invitation creation
    if (action === 'createInvitedUser') {
      // Implementation for creating a new user from invitation
      // Would need additional parameters like firstName, lastName, password
      // This would involve:
      // 1. Creating the auth user
      // 2. Creating the profile
      // 3. Linking the user to the property
      // 4. Marking the invitation as used
      
      // Simplified response for now
      return new Response(
        JSON.stringify({ message: "User creation from invitation would be implemented here" }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    throw new Error('Invalid action')
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
