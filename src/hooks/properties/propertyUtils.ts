
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
