
import { useState } from "react";
import { validateImages } from "@/utils/imageUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function usePropertyImages() {
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      if (!validateImages(newFiles)) return;
      
      const newImageUrls = newFiles.map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newFiles]);
      setImageUrls(prev => [...prev, ...newImageUrls]);
      
      console.log(`Added ${newFiles.length} new images. Total: ${images.length + newFiles.length}`);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imageUrls[index]);
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
    setImageUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
    console.log(`Removed image at index ${index}. Remaining: ${images.length - 1}`);
  };

  const uploadImages = async (propertyId: string) => {
    try {
      const results = [];
      
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileExt = file.name.split('.').pop();
        const filePath = `${propertyId}/${Date.now()}-${i}.${fileExt}`;
        
        console.log(`Uploading image ${i+1}/${images.length}: ${filePath}`);
        
        const { error: uploadError } = await supabase.storage
          .from('property_images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (uploadError) {
          console.error(`Error uploading image ${i+1}:`, uploadError);
          throw uploadError;
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('property_images')
          .getPublicUrl(filePath);
          
        console.log(`Image ${i+1} URL:`, publicUrlData.publicUrl);
        
        try {
          const { error: imageError } = await supabase
            .from('property_images')
            .insert({
              property_id: propertyId,
              url: publicUrlData.publicUrl,
              is_primary: i === 0,
            });
            
          if (imageError) {
            console.error(`Error saving image ${i+1} reference:`, imageError);
            throw imageError;
          }
        } catch (recordError) {
          console.error("Error saving image record:", recordError);
        }
        
        results.push({ path: filePath, url: publicUrlData.publicUrl });
      }
      
      console.log(`Successfully uploaded ${results.length} images for property ${propertyId}`);
      return results;
    } catch (uploadError: any) {
      console.error("Error processing images:", uploadError);
      toast.error("Property added but there was an issue with uploading some images");
      return [];
    }
  };

  return {
    images,
    imageUrls,
    handleImageChange,
    removeImage,
    uploadImages,
    resetImages: () => {
      imageUrls.forEach(url => URL.revokeObjectURL(url));
      setImages([]);
      setImageUrls([]);
    }
  };
}
