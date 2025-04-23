
import { supabase } from "@/integrations/supabase/client";
import type { Property, PropertyRole } from "@/types/property";

export async function fetchPropertiesByRole(userId: string, userRole: PropertyRole): Promise<Property[]> {
  let propertiesData: any[] = [];
  
  try {
    console.log(`Fetching properties for user ${userId} with role ${userRole}`);
    
    // Different fetching strategy based on user role
    if (userRole === 'tenant') {
      // Directly query tenant property links to avoid recursion
      const { data: links, error: linkError } = await supabase
        .from('tenant_property_link')
        .select('property_id')
        .eq('tenant_id', userId);
        
      if (linkError) {
        console.error('Error fetching tenant property links:', linkError);
        throw linkError;
      }
      
      if (!links || links.length === 0) {
        console.log('No tenant property links found');
        return [];
      }
      
      // Extract property IDs
      const propertyIds = links.map(link => link.property_id);
      console.log('Tenant property IDs:', propertyIds);
      
      // Fetch properties using the collected IDs
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, name, address, details')
        .in('id', propertyIds);
        
      if (propertiesError) {
        console.error('Error fetching tenant properties:', propertiesError);
        throw propertiesError;
      }
      
      propertiesData = properties || [];
      
    } else if (userRole === 'service_provider') {
      // Directly query service provider property links to avoid recursion
      const { data: links, error: linkError } = await supabase
        .from('service_provider_property_link')
        .select('property_id')
        .eq('service_provider_id', userId);
        
      if (linkError) {
        console.error('Error fetching service provider property links:', linkError);
        throw linkError;
      }
      
      if (!links || links.length === 0) {
        console.log('No service provider property links found');
        return [];
      }
      
      // Extract property IDs
      const propertyIds = links.map(link => link.property_id);
      console.log('Service provider property IDs:', propertyIds);
      
      // Fetch properties using the collected IDs
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, name, address, details')
        .in('id', propertyIds);
        
      if (propertiesError) {
        console.error('Error fetching service provider properties:', propertiesError);
        throw propertiesError;
      }
      
      propertiesData = properties || [];
      
    } else if (userRole === 'owner') {
      // Direct query for owners, should work with RLS policies
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, name, address, details')
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
