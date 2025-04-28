
import { supabase } from "@/integrations/supabase/client";
import type { Property } from "@/types/property";
import { convertDetailsToPropertyDetails } from "./propertyUtils";

export async function fetchServiceProviderProperties(userId: string): Promise<Property[]> {
  try {
    const { data: propertyIds, error: functionError } = await supabase
      .rpc('get_service_provider_properties_by_id', { provider_id_param: userId });

    if (functionError) {
      console.error('Error calling get_service_provider_properties_by_id:', functionError);
      throw functionError;
    }

    if (!propertyIds || propertyIds.length === 0) {
      console.log('No service provider properties found');
      return [];
    }

    const { data: propertiesData, error: propertiesError } = await supabase
      .from('properties')
      .select('id, name, address, details')
      .in('id', propertyIds);

    if (propertiesError) {
      console.error('Error fetching service provider properties:', propertiesError);
      throw propertiesError;
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
