
import { supabase } from "@/integrations/supabase/client";
import type { Property } from "@/types/property";

export async function fetchServiceProviderProperties(providerId: string): Promise<Property[]> {
  try {
    console.log("Fetching properties for service provider:", providerId);
    
    if (!providerId) {
      console.error("No service provider ID provided");
      return [];
    }
    
    // Use our security definer function to avoid recursion
    const { data, error } = await supabase
      .from('service_provider_property_link')
      .select('property_id')
      .eq('service_provider_id', providerId);
      
    if (error) {
      console.error("Error fetching service provider property links:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log("No property links found for service provider");
      return [];
    }
    
    const propertyIds = data.map(link => link.property_id);
    
    // Get property details
    const { data: propertiesData, error: propertiesError } = await supabase
      .from('properties')
      .select('id, name, address, details')
      .in('id', propertyIds);
      
    if (propertiesError) {
      console.error("Error fetching properties:", propertiesError);
      throw propertiesError;
    }
    
    console.log(`Fetched ${propertiesData?.length || 0} properties for service provider`);
    
    // Transform to Property type
    const properties: Property[] = (propertiesData || []).map(p => ({
      id: p.id,
      name: p.name,
      address: p.address,
      details: p.details
    }));
    
    return properties;
  } catch (error) {
    console.error("Error in fetchServiceProviderProperties:", error);
    throw error;
  }
}
