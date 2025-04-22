
import { supabase } from "@/integrations/supabase/client";
import type { Property, PropertyRole } from "@/types/property";

export async function fetchPropertiesByRole(userId: string, userRole: PropertyRole): Promise<Property[]> {
  let propertiesData: any[] = [];
  
  try {
    // Different fetching strategy based on user role
    if (userRole === 'tenant') {
      const { data: propertyIds, error: linkError } = await supabase
        .rpc('get_tenant_properties', { tenant_id: userId });
        
      if (linkError) throw linkError;
      
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
        
      if (propertiesError) throw propertiesError;
      propertiesData = properties || [];
      
    } else if (userRole === 'service_provider') {
      const { data: propertyIds, error: linkError } = await supabase
        .rpc('get_service_provider_properties', { provider_id: userId });
        
      if (linkError) throw linkError;
      
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
        
      if (propertiesError) throw propertiesError;
      propertiesData = properties || [];
      
    } else if (userRole === 'owner') {
      // Direct query using RLS policy for owners
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
