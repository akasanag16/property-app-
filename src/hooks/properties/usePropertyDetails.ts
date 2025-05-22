
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Property } from "@/types/property";
import { convertDetailsToPropertyDetails } from "./propertyUtils";

export function usePropertyDetails(propertyId: string, open: boolean) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (!propertyId || !open) return;
    
    const fetchProperty = async () => {
      setLoading(true);
      try {
        // Use the safe_get_owner_properties RPC function to avoid infinite recursion
        const { data: propertiesData, error: propertiesError } = await supabase
          .rpc('safe_get_owner_properties', { owner_id_param: user?.id });
          
        if (propertiesError) {
          console.error("Error fetching properties:", propertiesError);
          toast.error("Failed to load property details");
          setLoading(false);
          return;
        }
        
        // Find the specific property by ID from the returned data
        const propertyData = propertiesData?.find(p => p.id === propertyId);
        
        if (propertyData) {
          const propertyWithDetails: Property = {
            id: propertyData.id,
            name: propertyData.name,
            address: propertyData.address,
            details: convertDetailsToPropertyDetails(propertyData.details),
            owner_id: propertyData.owner_id,
            image_url: null
          };
          setProperty(propertyWithDetails);
          setName(propertyWithDetails.name);
        } else {
          toast.error("Property not found");
        }
      } catch (err) {
        console.error("Error in fetchProperty:", err);
        toast.error("An error occurred while loading property details");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [open, propertyId, user?.id]);

  const handleSave = async () => {
    if (!propertyId || !property || !user?.id) return;
    
    setLoading(true);
    try {
      // Use the safe_update_property_details RPC function to update the property name
      const { data, error } = await supabase
        .rpc('safe_update_property_details', {
          property_id_param: propertyId,
          owner_id_param: user.id,
          name_param: name
        });
      
      if (error) {
        console.error("Error updating property:", error);
        toast.error("Failed to update property: " + error.message);
      } else {
        setProperty({ 
          ...property, 
          name 
        });
        toast.success("Property updated successfully");
        setEditing(false);
        return true;
      }
    } catch (err) {
      console.error("Error in handleSave:", err);
      toast.error("An error occurred while saving property details");
    } finally {
      setLoading(false);
    }
    return false;
  };

  const resetState = () => {
    setEditing(false);
    if (property) {
      setName(property.name);
    }
  };

  return {
    property,
    loading,
    editing,
    setEditing,
    name,
    setName,
    handleSave,
    resetState
  };
}
