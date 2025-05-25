
import { getSupabaseClient } from "../utils.ts";

export async function validateInvitation(token: string, email: string, role: string) {
  const supabaseClient = getSupabaseClient();
  const tableName = role === 'tenant' ? 'tenant_invitations' : 'service_provider_invitations';
  
  // Verify the invitation exists and is valid
  const { data: invitation, error: invitationError } = await supabaseClient
    .from(tableName)
    .select('*')
    .eq('link_token', token)
    .eq('email', email)
    .eq('is_used', false)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (invitationError) {
    console.error('Error checking invitation:', invitationError);
    throw new Error('Failed to validate invitation');
  }

  if (!invitation) {
    console.error('Invalid or expired invitation');
    throw new Error('Invalid or expired invitation. Please request a new invitation.');
  }

  return { invitation, tableName };
}

export async function markInvitationAsUsed(tableName: string, token: string, email: string, userId: string) {
  const supabaseClient = getSupabaseClient();
  
  const { error: inviteError } = await supabaseClient
    .from(tableName)
    .update({ 
      is_used: true,
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      accepted_by_user_id: userId
    })
    .eq('link_token', token)
    .eq('email', email);

  if (inviteError) {
    console.error('Error updating invitation:', inviteError);
    throw new Error('Failed to mark invitation as used');
  }
}
