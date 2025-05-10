
import { supabase } from "@/integrations/supabase/client";
import type { Property } from "@/types/property";
import { convertDetailsToPropertyDetails } from "./propertyUtils";

export async function fetchOwnerProperties(userId: string): Promise<Property[]> {
  try {
    console.log('Fetching owner properties for user ID:', userId);
    
    if (!userId) {
      console.warn('No owner ID provided to fetchOwnerProperties');
      return [];
    }

    // Use the security definer function to avoid infinite recursion
    const { data: propertiesData, error: propertiesError } = await supabase
      .rpc('safe_get_owner_properties', { owner_id_param: userId });
    
    if (propertiesError) {
      console.error('Error fetching owner properties:', propertiesError);
      throw propertiesError;
    }

    console.log('Owner properties data:', propertiesData);
    
    return (propertiesData || []).map(prop => ({
      id: prop.id,
      name: prop.name,
      address: prop.address,
      details: convertDetailsToPropertyDetails(prop.details),
      owner_id: prop.owner_id,
      image_url: null
    }));
  } catch (error) {
    console.error('Error in fetchOwnerProperties:', error);
    return [];
  }
}
