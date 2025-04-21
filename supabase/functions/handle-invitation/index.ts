
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
    const { action, invitation_id, invitation_type } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const tableName = invitation_type === 'tenant' ? 'tenant_invitations' : 'service_provider_invitations'

    if (action === 'resend') {
      const { data: invitation, error: fetchError } = await supabaseClient
        .from(tableName)
        .select('*')
        .eq('id', invitation_id)
        .single()

      if (fetchError) throw fetchError

      const { error: updateError } = await supabaseClient.rpc('update_invitation_expiry', {
        p_invitation_id: invitation_id,
        p_invitation_type: invitation_type
      })

      if (updateError) throw updateError

      return new Response(
        JSON.stringify({ message: 'Invitation resent successfully' }),
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
