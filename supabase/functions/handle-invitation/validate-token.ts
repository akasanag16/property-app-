
import { getSupabaseClient, corsHeaders, createSuccessResponse, createErrorResponse } from "./utils.ts";

export async function validateToken(requestData: any) {
  const { token, email } = requestData;
  
  if (!token || !email) {
    return createErrorResponse("Missing token or email", 400);
  }

  // Normalize email to lowercase for consistency
  const normalizedEmail = email.toLowerCase().trim();
  
  console.log(`Validating token for email: ${normalizedEmail}`);
  const supabaseClient = getSupabaseClient();

  try {
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
        .eq('email', normalizedEmail)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (error) {
        console.error(`Error checking ${table}:`, error);
        continue;
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
      return createErrorResponse("Invalid or expired invitation", 400);
    }

    return createSuccessResponse({ 
      valid: true, 
      propertyId, 
      role,
      email: normalizedEmail,
      token,
      invitationType,
      invitationId: validInvitation.id
    });
  } catch (error: any) {
    console.error("Error validating token:", error);
    return createErrorResponse(error.message || "Error validating invitation", 500);
  }
}
