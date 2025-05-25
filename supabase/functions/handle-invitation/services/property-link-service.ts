
import { getSupabaseClient } from "../utils.ts";

export async function createPropertyLink(propertyId: string, userId: string, role: string) {
  const supabaseClient = getSupabaseClient();
  const linkTableName = role === 'tenant' ? 'tenant_property_link' : 'service_provider_property_link';

  // Create property link
  const linkData: any = {
    property_id: propertyId,
  };
  
  if (role === 'tenant') {
    linkData.tenant_id = userId;
  } else {
    linkData.service_provider_id = userId;
  }
    
  const { error: linkError } = await supabaseClient
    .from(linkTableName)
    .insert(linkData);

  if (linkError) {
    console.error('Error creating property link:', linkError);
    throw new Error('Failed to link user to property');
  }
}
