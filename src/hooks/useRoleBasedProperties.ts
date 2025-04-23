
import { supabase } from "@/integrations/supabase/client";
import type { Property, PropertyRole } from "@/types/property";

export async function fetchPropertiesByRole(userId: string, userRole: PropertyRole): Promise<Property[]> {
  let properties: Property[] = [];
  
  try {
    console.log(`Fetching properties for user ${userId} with role ${userRole}`);
    
    if (!userId) {
      console.warn("No user ID provided to fetchPropertiesByRole");
      return [];
    }

    if (userRole === 'tenant') {
      // Use the security definer function to get property IDs
      const { data: propertyIds, error: functionError } = await supabase
        .rpc('get_tenant_properties_by_id', { tenant_id_param: userId });
        
      if (functionError) {
        console.error('Error calling get_tenant_properties_by_id:', functionError);
        throw functionError;
      }
      
      if (!propertyIds || propertyIds.length === 0) {
        console.log('No tenant properties found');
        return [];
      }
      
      // Fetch the actual properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, name, address, details')
        .in('id', propertyIds);
        
      if (propertiesError) {
        console.error('Error fetching tenant properties:', propertiesError);
        throw propertiesError;
      }
      
      properties = propertiesData || [];
      
    } else if (userRole === 'service_provider') {
      // Use the security definer function to get property IDs
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
      
      // Fetch the actual properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, name, address, details')
        .in('id', propertyIds);
        
      if (propertiesError) {
        console.error('Error fetching service provider properties:', propertiesError);
        throw propertiesError;
      }
      
      properties = propertiesData || [];
      
    } else if (userRole === 'owner') {
      // Direct query for owners using owner_id field
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, name, address, details')
        .eq('owner_id', userId);
        
      if (propertiesError) {
        console.error('Error fetching owner properties:', propertiesError);
        throw propertiesError;
      }
      
      properties = propertiesData || [];
    }

    // Format and return properties
    return properties.map(prop => ({
      id: prop.id,
      name: prop.name,
      address: prop.address,
      details: typeof prop.details === 'object' ? prop.details : {}
    }));
    
  } catch (error) {
    console.error('Error in fetchPropertiesByRole:', error);
    throw error;
  }
}
