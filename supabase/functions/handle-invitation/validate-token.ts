
import { getSupabaseClient, corsHeaders, createSuccessResponse } from "./utils.ts";

export async function validateToken(requestData: any) {
  const { token, email } = requestData;
  
  if (!token || !email) {
    throw new Error("Missing token or email");
  }

  console.log(`Validating token for email: ${email}`);
  const supabaseClient = getSupabaseClient();

  // Check both tenant and service provider invitation tables
  const tablesToCheck = ['tenant_invitations', 'service_provider_invitations'];
  let validInvitation = null;
  let propertyId = null;
  let role = null;
  let invitationType = null;

  for (const table of tablesToCheck) {
    const { data, error } = await supabaseClient
      .from(table)
      .select('*')
      .eq('link_token', token)
      .eq('email', email)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.error(`Error checking ${table}:`, error);
      throw error;
    }
    
    if (data) {
      validInvitation = data;
      propertyId = data.property_id;
      role = table === 'tenant_invitations' ? 'tenant' : 'service_provider';
      invitationType = table === 'tenant_invitations' ? 'tenant' : 'service_provider';
      console.log(`Found valid invitation in ${table}`);
      break;
    }
  }

  if (!validInvitation) {
    console.log('No valid invitation found');
    return new Response(
      JSON.stringify({ valid: false, message: "Invalid or expired invitation" }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }

  return createSuccessResponse({ 
    valid: true, 
    propertyId, 
    role,
    email,
    token,
    invitationType,
    invitationId: validInvitation.id
  });
}
