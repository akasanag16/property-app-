
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function usePropertyForm(onSuccess: () => void) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [property, setProperty] = useState({
    name: "",
    address: "",
    type: "apartment",
    bedrooms: "2",
    bathrooms: "1",
    area: "",
    rent: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProperty((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setProperty((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      const invalidFiles = newFiles.filter(file => !file.type.startsWith('image/'));
      if (invalidFiles.length > 0) {
        toast.error("Only image files are allowed");
        return;
      }
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      const oversizedFiles = newFiles.filter(file => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        toast.error(`Some images are too large. Maximum size is 5MB per image.`);
        return;
      }
      
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error("You must be logged in to add properties");
      return;
    }
    
    if (!property.name || !property.address) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log("Adding property for user ID:", user.id);
      
      // Create a timeout to abort the request if it takes too long
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const { data: propertyData, error: propertyError } = await supabase
        .from("properties")
        .insert({
          name: property.name,
          address: property.address,
          owner_id: user.id,
          details: {
            type: property.type,
            bedrooms: parseInt(property.bedrooms),
            bathrooms: parseFloat(property.bathrooms),
            area: property.area ? parseFloat(property.area) : null,
            rent: property.rent ? parseFloat(property.rent) : null,
          }
        })
        .select()
        .single()
        .abortSignal(controller.signal);
      
      clearTimeout(timeoutId);
      
      if (propertyError) {
        console.error("Error creating property:", propertyError);
        
        if (propertyError.code === '42P17') {
          // Handle infinite recursion error specifically
          toast.error("There's an issue with the database permissions. Please contact support.");
          return;
        }
        
        throw propertyError;
      }
      
      if (propertyData?.id && images.length > 0) {
        await uploadImages(propertyData.id);
      }
      
      toast.success("Property added successfully");
      resetForm();
      onSuccess();
    } catch (error: any) {
      console.error("Error adding property:", error);
      
      if (error.message?.includes('AbortError')) {
        toast.error("Request timed out. Please try again.");
      } else if (error.code === '42P17' || error.message?.includes('infinite recursion')) {
        toast.error("There's an issue with the database permissions. Please try refreshing the page.");
      } else {
        toast.error(error.message || "Failed to add property");
      }
    } finally {
      setIsSubmitting(false);
    }
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
          .upload(filePath, file);
          
        if (uploadError) {
          console.error(`Error uploading image ${i+1}:`, uploadError);
          throw uploadError;
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('property_images')
          .getPublicUrl(filePath);
          
        console.log(`Image ${i+1} URL:`, publicUrlData.publicUrl);
        
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

  const resetForm = () => {
    setProperty({
      name: "",
      address: "",
      type: "apartment",
      bedrooms: "2",
      bathrooms: "1",
      area: "",
      rent: "",
    });
    setImages([]);
    setImageUrls([]);
  };

  return {
    property,
    images,
    imageUrls,
    isSubmitting,
    handleChange,
    handleSelectChange,
    handleImageChange,
    removeImage,
    handleSubmit,
  };
}
