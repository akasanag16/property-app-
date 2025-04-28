
import { supabase } from "@/integrations/supabase/client";
import type { Property, PropertyRole } from "@/types/property";
import { fetchTenantProperties } from "./properties/useTenantProperties";
import { fetchServiceProviderProperties } from "./properties/useServiceProviderProperties";
import { fetchOwnerProperties } from "./properties/useOwnerProperties";

export async function fetchPropertiesByRole(userId: string, userRole: PropertyRole): Promise<Property[]> {
  try {
    console.log(`Fetching properties for user ${userId} with role ${userRole}`);

    if (!userId) {
      console.warn("No user ID provided to fetchPropertiesByRole");
      return [];
    }

    // Check available tables in the database
    const { data: tables, error: tablesError } = await supabase
      .rpc('list_public_tables');
    
    if (tablesError) {
      console.error('Could not check database tables:', tablesError);
    } else if (tables) {
      console.log('Available tables in database:', tables);
    }

    // Fetch properties based on user role
    switch (userRole) {
      case 'tenant':
        return await fetchTenantProperties(userId);
      
      case 'service_provider':
        return await fetchServiceProviderProperties(userId);
      
      case 'owner':
        return await fetchOwnerProperties(userId);
      
      default:
        console.warn(`Unknown user role: ${userRole}`);
        return [];
    }

  } catch (error) {
    console.error('Error in fetchPropertiesByRole:', error);
    throw error;
  }
}
