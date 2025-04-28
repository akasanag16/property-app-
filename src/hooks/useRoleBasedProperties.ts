
import { supabase } from "@/integrations/supabase/client";
import type { Property, PropertyDetails, PropertyRole } from "@/types/property";

export async function fetchPropertiesByRole(userId: string, userRole: PropertyRole): Promise<Property[]> {
  let properties: Property[] = [];

  try {
    console.log(`Fetching properties for user ${userId} with role ${userRole}`);

    if (!userId) {
      console.warn("No user ID provided to fetchPropertiesByRole");
      return [];
    }

    // Use a raw SQL query to check for tables instead of pg_tables
    const { data: tables, error: tablesError } = await supabase
      .rpc('list_tables')
      .catch(() => {
        console.log('Function list_tables not found, will proceed with standard queries');
        return { data: null, error: new Error('Function not found') };
      });
    
    if (tablesError) {
      console.error('Could not check database tables:', tablesError);
    } else if (tables) {
      console.log('Available tables in database:', tables);
    }

    if (userRole === 'tenant') {
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

      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, name, address, details')
        .in('id', propertyIds);

      if (propertiesError) {
        console.error('Error fetching tenant properties:', propertiesError);
        throw propertiesError;
      }

      console.log('Tenant properties data:', propertiesData);
      properties = (propertiesData || []).map(prop => ({
        id: prop.id,
        name: prop.name,
        address: prop.address,
        details: convertDetailsToPropertyDetails(prop.details)
      }));

    } else if (userRole === 'service_provider') {
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
      properties = (propertiesData || []).map(prop => ({
        id: prop.id,
        name: prop.name,
        address: prop.address,
        details: convertDetailsToPropertyDetails(prop.details)
      }));

    } else if (userRole === 'owner') {
      // Try direct query first to check if RLS is working
      console.log('Attempting direct query for owner properties');
      const { data: directProperties, error: directError } = await supabase
        .from('properties')
        .select('id, name, address, details, owner_id')
        .eq('owner_id', userId);
      
      if (directError) {
        console.error('Direct query error:', directError);
      } else {
        console.log('Direct query results:', directProperties);
      }

      // Now use the security definer function
      console.log('Using get_owner_properties function for owner properties');
      const { data: propertyIds, error: functionError } = await supabase
        .rpc('get_owner_properties', { owner_id_param: userId });

      if (functionError) {
        console.error('Error calling get_owner_properties:', functionError);
        throw functionError;
      }

      console.log('Owner property IDs:', propertyIds);
      if (!propertyIds || propertyIds.length === 0) {
        console.log('No owner properties found');
        return [];
      }

      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, name, address, details')
        .in('id', propertyIds);

      if (propertiesError) {
        console.error('Error fetching owner properties:', propertiesError);
        throw propertiesError;
      }

      console.log('Owner properties data:', propertiesData);
      properties = (propertiesData || []).map(prop => ({
        id: prop.id,
        name: prop.name,
        address: prop.address,
        details: convertDetailsToPropertyDetails(prop.details)
      }));

      // If still no properties, try the edge function as a fallback
      if (properties.length === 0) {
        console.log('Trying edge function as fallback');
        try {
          const { data: edgeData, error: edgeError } = await supabase.functions.invoke(
            "create-property",
            {
              method: "POST",
              body: {
                action: "fetch",
                owner_id: userId
              }
            }
          );
          
          if (edgeError) {
            console.error('Edge function error:', edgeError);
          } else if (edgeData && edgeData.length > 0) {
            console.log('Edge function results:', edgeData);
            properties = edgeData;
          }
        } catch (edgeFunctionError) {
          console.error('Error calling edge function:', edgeFunctionError);
        }
      }
    }

    return properties;

  } catch (error) {
    console.error('Error in fetchPropertiesByRole:', error);
    throw error;
  }
}

// Helper function to convert Json to PropertyDetails
function convertDetailsToPropertyDetails(details: any): PropertyDetails {
  if (!details) {
    return {};
  }

  if (typeof details === 'object') {
    return {
      type: details.type as string | undefined,
      bedrooms: details.bedrooms as number | undefined,
      bathrooms: details.bathrooms as number | undefined,
      area: details.area as number | undefined,
      rent: details.rent as number | undefined,
    };
  }

  if (typeof details === 'string') {
    try {
      const parsed = JSON.parse(details);
      return convertDetailsToPropertyDetails(parsed);
    } catch (e) {
      console.warn('Could not parse property details:', details);
      return {};
    }
  }

  return {};
}
