
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePropertyFormState } from "./usePropertyFormState";
import { usePropertyImages } from "./usePropertyImages";

export function usePropertyForm(onSuccess: () => void) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { property, handleChange, handleSelectChange, resetForm } = usePropertyFormState();
  const { images, imageUrls, handleImageChange, removeImage, uploadImages, resetImages } = usePropertyImages();

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
      
      const timeoutId = setTimeout(() => {
        setIsSubmitting(false);
        toast.error("Request timed out. Please try again.");
      }, 10000);

      // Use edge function to create property
      const { data, error } = await supabase.functions.invoke(
        "create-property",
        {
          method: "POST",
          body: {
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
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.error("Error creating property:", error);
        throw error;
      }
      
      if (data?.id && images.length > 0) {
        await uploadImages(data.id);
      }
      
      toast.success("Property added successfully");
      resetForm();
      resetImages();
      onSuccess();
    } catch (error: any) {
      console.error("Error adding property:", error);
      toast.error(error.message || "Failed to add property");
    } finally {
      setIsSubmitting(false);
    }
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
