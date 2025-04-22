
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
        .rpc('get_tenant_properties', { tenant_id: userId });
        
      if (linkError) {
        console.error('Error fetching tenant property IDs:', linkError);
        throw linkError;
      }
      
      console.log('Tenant property IDs:', propertyIds);
      
      if (!propertyIds || propertyIds.length === 0) {
        return [];
      }
      
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          id,
          name,
          address,
          details
        `)
        .in('id', propertyIds);
        
      if (propertiesError) {
        console.error('Error fetching tenant properties:', propertiesError);
        throw propertiesError;
      }
      
      propertiesData = properties || [];
      
    } else if (userRole === 'service_provider') {
      // Use the Direct FROM query for service providers since our function returns full rows
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          id,
          name,
          address,
          details
        `)
        .in('id', async () => {
          const { data: propertyIds, error } = await supabase
            .rpc('get_service_provider_properties', { provider_id: userId });
          if (error) throw error;
          return propertyIds as string[];
        });
        
      if (propertiesError) {
        console.error('Error fetching service provider properties:', propertiesError);
        throw propertiesError;
      }
      
      propertiesData = properties || [];
      
    } else if (userRole === 'owner') {
      // Direct query for owners, should work with our new RLS policies
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
