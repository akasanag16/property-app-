
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
      const newImageUrls = newFiles.map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newFiles]);
      setImageUrls(prev => [...prev, ...newImageUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    URL.revokeObjectURL(imageUrls[index]);
    setImageUrls(imageUrls.filter((_, i) => i !== index));
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
        .single();
      
      if (propertyError) {
        console.error("Error creating property:", propertyError);
        throw propertyError;
      }
      
      if (propertyData.id && images.length > 0) {
        await uploadImages(propertyData.id);
      }
      
      toast.success("Property added successfully");
      resetForm();
      onSuccess();
    } catch (error: any) {
      console.error("Error adding property:", error);
      toast.error(error.message || "Failed to add property");
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadImages = async (propertyId: string) => {
    try {
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileExt = file.name.split('.').pop();
        const filePath = `${propertyId}/${Date.now()}-${i}.${fileExt}`;
        
        console.log("Uploading image:", filePath);
        
        const { error: uploadError } = await supabase.storage
          .from('property_images')
          .upload(filePath, file);
          
        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          throw uploadError;
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('property_images')
          .getPublicUrl(filePath);
          
        console.log("Image URL:", publicUrlData.publicUrl);
        
        const { error: imageError } = await supabase
          .from('property_images')
          .insert({
            property_id: propertyId,
            url: publicUrlData.publicUrl,
            is_primary: i === 0,
          });
          
        if (imageError) {
          console.error("Error saving image reference:", imageError);
          throw imageError;
        }
      }
    } catch (uploadError) {
      console.error("Error processing images:", uploadError);
      toast.error("Property added but there was an issue with uploading images");
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
