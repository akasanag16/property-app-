
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sampleProperties } from "@/data/sampleProperties";

export type Property = {
  id: string;
  name: string;
  address: string;
  details?: {
    type?: string;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    rent?: number;
  };
  image_url?: string;
};

export function useProperties(userId?: string) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      console.log("Fetching properties for user:", userId);
      
      // Use the edge function to fetch properties to bypass RLS
      const { data, error } = await supabase.functions.invoke(
        "create-property", 
        {
          method: "GET",
          body: { action: "fetch", owner_id: userId }
        }
      );

      if (error) {
        console.error("Error from edge function:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log("No properties found from API, using sample data");
        useSampleProperties();
        return;
      }
      
      // Transform the data to match our Property type
      const transformedProperties = data.map(item => {
        // Find primary image if available
        const primaryImage = item.property_images?.find(img => img.is_primary);
        
        return {
          id: item.id,
          name: item.name,
          address: item.address,
          details: item.details as Property['details'],
          image_url: primaryImage?.url
        };
      });
      
      console.log("Fetched properties:", transformedProperties);
      setProperties(transformedProperties);
      setFilteredProperties(transformedProperties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Failed to load properties");
      useSampleProperties();
    } finally {
      setLoading(false);
    }
  };

  const useSampleProperties = () => {
    // Use sample properties as fallback
    const samplePropertiesWithImgUrl = sampleProperties.map(prop => ({
      id: prop.id,
      name: prop.name,
      address: prop.address,
      details: {
        type: prop.type,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        area: prop.area,
        rent: prop.rent
      },
      image_url: prop.photos[0]?.url
    }));
    
    setProperties(samplePropertiesWithImgUrl);
    setFilteredProperties(samplePropertiesWithImgUrl);
  };

  useEffect(() => {
    if (!userId) return;
    
    fetchProperties();

    // Set up realtime subscription for properties table
    const propertiesChannel = supabase
      .channel('properties-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'properties',
          filter: `owner_id=eq.${userId}`,
        },
        () => {
          console.log("Properties change detected");
          fetchProperties();
        }
      )
      .subscribe();
      
    // Set up realtime subscription for property_images table
    const imagesChannel = supabase
      .channel('property-images-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'property_images'
        },
        () => {
          console.log("Property images change detected");
          fetchProperties();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(propertiesChannel);
      supabase.removeChannel(imagesChannel);
    };
  }, [userId, refreshKey]);

  return {
    properties,
    filteredProperties,
    setFilteredProperties,
    loading,
    handleRefresh
  };
}
