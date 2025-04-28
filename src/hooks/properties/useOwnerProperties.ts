
import { supabase } from "@/integrations/supabase/client";
import type { Property } from "@/types/property";
import { convertDetailsToPropertyDetails } from "./propertyUtils";

export async function fetchOwnerProperties(userId: string): Promise<Property[]> {
  try {
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
      if (directProperties && directProperties.length > 0) {
        return directProperties.map(prop => ({
          id: prop.id,
          name: prop.name,
          address: prop.address,
          details: convertDetailsToPropertyDetails(prop.details)
        }));
      }
    }

    // Try using the security definer function
    console.log('Using get_owner_properties function for owner properties');
    const { data: propertyIds, error: functionError } = await supabase
      .rpc('get_owner_properties', { owner_id_param: userId });

    if (functionError) {
      console.error('Error calling get_owner_properties:', functionError);
      throw functionError;
    }

    console.log('Owner property IDs:', propertyIds);
    if (!propertyIds || propertyIds.length === 0) {
      console.log('No owner properties found via function');
      
      // Try edge function as a fallback
      return await fetchOwnerPropertiesViaEdgeFunction(userId);
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
    return (propertiesData || []).map(prop => ({
      id: prop.id,
      name: prop.name,
      address: prop.address,
      details: convertDetailsToPropertyDetails(prop.details)
    }));
  } catch (error) {
    console.error('Error in fetchOwnerProperties:', error);
    
    // Try edge function as a final fallback
    return await fetchOwnerPropertiesViaEdgeFunction(userId);
  }
}

async function fetchOwnerPropertiesViaEdgeFunction(userId: string): Promise<Property[]> {
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
      return [];
    } else if (edgeData && edgeData.length > 0) {
      console.log('Edge function results:', edgeData);
      return edgeData;
    }
    return [];
  } catch (edgeFunctionError) {
    console.error('Error calling edge function:', edgeFunctionError);
    return [];
  }
}
