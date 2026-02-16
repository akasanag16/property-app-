
/**
 * Returns the base URL for invitation links.
 * Always uses the published app URL so invited users can access the link
 * without needing Lovable project access.
 */
export function getInvitationBaseUrl(): string {
  // Use the current origin - this works correctly when:
  // - Owner sends invite from published app → generates published URL
  // - Owner sends invite from localhost → generates localhost URL
  return window.location.origin;
}
