
import { supabase } from "@/integrations/supabase/client";
import type { Property } from "@/types/property";
import { convertDetailsToPropertyDetails } from "./propertyUtils";

export async function fetchServiceProviderProperties(providerId: string): Promise<Property[]> {
  try {
    console.log("Fetching properties for service provider:", providerId);
    
    if (!providerId) {
      console.error("No service provider ID provided");
      return [];
    }
    
    // Use the security definer function to avoid recursion
    const { data, error } = await supabase
      .rpc('safe_get_service_provider_properties', { provider_id_param: providerId });
      
    if (error) {
      console.error("Error fetching service provider properties:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log("No properties found for service provider");
      return [];
    }
    
    console.log(`Fetched ${data.length || 0} properties for service provider`);
    
    // Transform to Property type with proper type conversion for details
    const properties: Property[] = data.map(p => ({
      id: p.id,
      name: p.name,
      address: p.address,
      details: convertDetailsToPropertyDetails(p.details)
    }));
    
    return properties;
  } catch (error) {
    console.error("Error in fetchServiceProviderProperties:", error);
    throw error;
  }
}
