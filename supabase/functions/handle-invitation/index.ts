
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
    const { action, token, email, firstName, lastName, password } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
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
    
    // Handle creating an invited user
    if (action === 'createInvitedUser') {
      const { token, email, propertyId, role, firstName, lastName, password } = await req.json()
      
      if (!token || !email || !propertyId || !role || !firstName || !lastName || !password) {
        throw new Error("Missing required parameters")
      }

      // Begin transaction
      const tableName = role === 'tenant' ? 'tenant_invitations' : 'service_provider_invitations'
      const linkTableName = role === 'tenant' ? 'tenant_property_link' : 'service_provider_property_link'
      
      try {
        // 1. Create the user account
        const { data: authUser, error: userError } = await supabaseClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
            role
          }
        })

        if (userError) throw userError

        // 2. Mark invitation as used
        const { error: inviteError } = await supabaseClient
          .from(tableName)
          .update({ 
            is_used: true,
            status: 'accepted',
            accepted_at: new Date().toISOString(),
            accepted_by_user_id: authUser.user.id
          })
          .eq('link_token', token)
          .eq('email', email)

        if (inviteError) throw inviteError

        // 3. Create property link
        const { error: linkError } = await supabaseClient
          .from(linkTableName)
          .insert({
            property_id: propertyId,
            [role === 'tenant' ? 'tenant_id' : 'service_provider_id']: authUser.user.id
          })

        if (linkError) throw linkError

        return new Response(
          JSON.stringify({ success: true }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      } catch (error) {
        console.error('Transaction error:', error)
        throw error
      }
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
