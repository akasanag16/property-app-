
import { supabase } from "@/integrations/supabase/client";
import type { Property, PropertyRole } from "@/types/property";

export async function fetchPropertiesByRole(userId: string, userRole: PropertyRole): Promise<Property[]> {
  let propertiesData: any[] = [];
  
  try {
    console.log(`Fetching properties for user ${userId} with role ${userRole}`);
    
    // Different fetching strategy based on user role
    if (userRole === 'tenant') {
      // Use the secure function to get tenant properties
      const { data: propertyIds, error: linkError } = await supabase
        .rpc('get_tenant_properties_by_id', { tenant_id_param: userId });
        
      if (linkError) {
        console.error('Error fetching tenant property IDs:', linkError);
        throw linkError;
      }
      
      console.log('Tenant property IDs:', propertyIds);
      
      if (!propertyIds || (Array.isArray(propertyIds) && propertyIds.length === 0)) {
        return [];
      }
      
      // Use the in clause with the returned property IDs
      const propertyIdsArray = propertyIds as string[];
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          id,
          name,
          address,
          details
        `)
        .in('id', propertyIdsArray);
        
      if (propertiesError) {
        console.error('Error fetching tenant properties:', propertiesError);
        throw propertiesError;
      }
      
      propertiesData = properties || [];
      
    } else if (userRole === 'service_provider') {
      // Fetch service provider properties using our new secure function
      const { data: propertyIds, error: idsError } = await supabase
        .rpc('get_service_provider_properties_by_id', { provider_id_param: userId });
        
      if (idsError) {
        console.error('Error fetching service provider property IDs:', idsError);
        throw idsError;
      }
      
      if (!propertyIds || (Array.isArray(propertyIds) && propertyIds.length === 0)) {
        return [];
      }
      
      const propertyIdsArray = propertyIds as string[];
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          id,
          name,
          address,
          details
        `)
        .in('id', propertyIdsArray);
        
      if (propertiesError) {
        console.error('Error fetching service provider properties:', propertiesError);
        throw propertiesError;
      }
      
      propertiesData = properties || [];
      
    } else if (userRole === 'owner') {
      // Direct query for owners, should work with our RLS policies
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          id,
          name,
          address,
          details
        `)
        .eq('owner_id', userId);
        
      if (propertiesError) {
        console.error('Error fetching owner properties:', propertiesError);
        throw propertiesError;
      }
      
      propertiesData = properties || [];
    }

    console.log('Fetched properties:', propertiesData);

    return propertiesData.map(prop => ({
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
