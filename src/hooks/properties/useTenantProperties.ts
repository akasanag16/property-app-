
import { supabase } from "@/integrations/supabase/client";
import type { Property } from "@/types/property";
import { convertDetailsToPropertyDetails } from "./propertyUtils";

export async function fetchTenantProperties(userId: string): Promise<Property[]> {
  try {
    console.log("Fetching tenant properties for user:", userId);
    
    if (!userId) {
      console.warn("No tenant ID provided");
      return [];
    }
    
    // Use our new security definer function to avoid infinite recursion
    const { data: propertiesData, error: propertiesError } = await supabase
      .rpc('safe_get_tenant_properties', { tenant_id_param: userId });
      
    if (propertiesError) {
      console.error('Error fetching tenant properties:', propertiesError);
      throw propertiesError;
    }

    if (!propertiesData || propertiesData.length === 0) {
      console.log('No tenant properties found');
      return [];
    }

    console.log('Tenant properties data:', propertiesData);
    
    return (propertiesData || []).map(prop => ({
      id: prop.id,
      name: prop.name,
      address: prop.address,
      details: convertDetailsToPropertyDetails(prop.details)
    }));

  } catch (error) {
    console.error('Error in fetchTenantProperties:', error);
    throw error;
  }
}
