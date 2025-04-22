
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Property } from "@/types/property";

export async function fetchPropertyImages(properties: Property[]): Promise<Property[]> {
  const propertiesWithImages = [...properties];

  for (const property of propertiesWithImages) {
    try {
      const { data: imageData, error: imageError } = await supabase
        .from('property_images')
        .select('url')
        .eq('property_id', property.id)
        .eq('is_primary', true)
        .maybeSingle();
        
      if (!imageError && imageData && imageData.url) {
        property.image_url = imageData.url;
      }
    } catch (error) {
      console.error("Error fetching property image:", error);
      // Continue with next property even if one fails
    }
  }

  return propertiesWithImages;
}

export function usePropertyImages() {
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
      
      const newUrls = newFiles.map(file => URL.createObjectURL(file));
      setImageUrls(prev => [...prev, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    
    URL.revokeObjectURL(imageUrls[index]);
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (propertyId: string) => {
    if (images.length === 0) return;
    
    try {
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${propertyId}/${Date.now()}.${fileExt}`;
        
        const { error: storageError, data: storageData } = await supabase.storage
          .from('property_images')
          .upload(fileName, file);
          
        if (storageError) {
          console.error("Error uploading image:", storageError);
          toast.error(`Failed to upload image ${i + 1}`);
          continue;
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('property_images')
          .getPublicUrl(fileName);
          
        const publicUrl = publicUrlData.publicUrl;
        
        // Insert the new property image record
        const propertyImageData = {
          property_id: propertyId,
          url: publicUrl,
          is_primary: i === 0
        };

        const { error: dbError } = await supabase
          .from('property_images')
          .insert(propertyImageData);
          
        if (dbError) {
          console.error("Error recording image in database:", dbError);
          toast.error(`Failed to register image ${i + 1}`);
        }
      }
    } catch (error: any) {
      console.error("Error in image upload process:", error);
      toast.error(error.message || "Failed to upload images");
    }
  };

  const resetImages = () => {
    imageUrls.forEach(url => URL.revokeObjectURL(url));
    setImages([]);
    setImageUrls([]);
  };

  return {
    images,
    imageUrls,
    handleImageChange,
    removeImage,
    uploadImages,
    resetImages
  };
}
