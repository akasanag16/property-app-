
import { supabase } from "@/integrations/supabase/client";
import type { Property } from "@/types/property";
import { convertDetailsToPropertyDetails } from "./propertyUtils";

export async function fetchServiceProviderProperties(userId: string): Promise<Property[]> {
  try {
    console.log('Fetching service provider properties for user:', userId);
    
    if (!userId) {
      console.warn('No provider ID provided');
      return [];
    }
    
    // Use our new security definer function to avoid infinite recursion
    const { data: propertiesData, error: propertiesError } = await supabase
      .rpc('safe_get_service_provider_properties', { provider_id_param: userId });

    if (propertiesError) {
      console.error('Error fetching service provider properties:', propertiesError);
      throw propertiesError;
    }

    if (!propertiesData || propertiesData.length === 0) {
      console.log('No service provider properties found');
      return [];
    }

    console.log('Service provider properties data:', propertiesData);
    return (propertiesData || []).map(prop => ({
      id: prop.id,
      name: prop.name,
      address: prop.address,
      details: convertDetailsToPropertyDetails(prop.details)
    }));
  } catch (error) {
    console.error('Error in fetchServiceProviderProperties:', error);
    throw error;
  }
}
