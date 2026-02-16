
/**
 * Returns the base URL for invitation links.
 * Always uses the published app URL so invited users can access the link
 * without needing Lovable project access.
 */
export function getInvitationBaseUrl(): string {
  const publishedUrl = "https://property-app-.lovable.app";
  
  // In local development, use localhost
  if (window.location.hostname === "localhost") {
    return window.location.origin;
  }
  
  return publishedUrl;
}
