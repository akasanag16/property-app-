
import { supabase } from "@/integrations/supabase/client";
import type { Property } from "@/types/property";

export async function fetchPropertyImages(properties: Property[]): Promise<Property[]> {
  const propertiesWithImages = [...properties];

  for (const property of propertiesWithImages) {
    const { data: imageData, error: imageError } = await supabase
      .from('property_images')
      .select('url')
      .eq('property_id', property.id)
      .eq('is_primary', true)
      .maybeSingle();
      
    if (!imageError && imageData) {
      property.image_url = imageData.url;
    }
  }

  return propertiesWithImages;
}
