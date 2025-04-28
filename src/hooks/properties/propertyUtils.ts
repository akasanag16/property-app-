
import { supabase } from "@/integrations/supabase/client";
import type { PropertyDetails } from "@/types/property";

// Helper function to convert Json to PropertyDetails
export function convertDetailsToPropertyDetails(details: any): PropertyDetails {
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

// Helper function to check if tables exist in the database
export async function checkTablesExist() {
  try {
    const { data: tables, error } = await supabase.rpc('list_public_tables');
    
    if (error) {
      console.error('Error checking database tables:', error);
      return null;
    }
    
    return tables || [];
  } catch (error) {
    console.error('Failed to check database tables:', error);
    return null;
  }
}
