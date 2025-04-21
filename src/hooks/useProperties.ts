
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
      const { data, error } = await supabase
        .from("properties")
        .select(`
          id, 
          name, 
          address, 
          details,
          property_images!inner(
            url,
            is_primary
          )
        `)
        .eq("owner_id", userId)
        .eq("property_images.is_primary", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our Property type
      const transformedProperties = data ? data.map(item => ({
        id: item.id,
        name: item.name,
        address: item.address,
        details: item.details as Property['details'],
        image_url: item.property_images?.[0]?.url
      })) : [];

      // If no properties found in database, use sample properties for demo
      if (transformedProperties.length === 0) {
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
      } else {
        setProperties(transformedProperties);
        setFilteredProperties(transformedProperties);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Failed to load properties");
      
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
    } finally {
      setLoading(false);
    }
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
