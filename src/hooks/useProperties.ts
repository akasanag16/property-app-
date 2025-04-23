
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sampleProperties } from "@/data/sampleProperties";
import type { Property, PropertyRole } from "@/types/property";
import { fetchPropertyImages } from "./usePropertyImages";
import { fetchPropertiesByRole } from "./useRoleBasedProperties";

export function useProperties(userId?: string) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const useSampleProperties = () => {
    console.log("Using sample properties data");
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
    setError(null);
    setLoading(false);
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!userId) {
        console.log("No user ID provided, using sample properties");
        useSampleProperties();
        return;
      }
      
      // First get the role of the user to determine the query approach
      console.log("Fetching user profile for ID:", userId);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error("Error fetching user role:", profileError);
        setError("Failed to fetch user role: " + profileError.message);
        useSampleProperties();
        return;
      }
      
      if (!profileData) {
        console.warn("No profile found for user:", userId);
        setError("No user profile found");
        useSampleProperties();
        return;
      }
      
      const userRole = profileData.role as PropertyRole;
      console.log("Fetching properties for role:", userRole);
      
      try {
        const propertiesData = await fetchPropertiesByRole(userId, userRole);
        console.log("Raw properties data:", propertiesData);
        
        if (propertiesData.length === 0) {
          console.log("No properties found for user");
          setProperties([]);
          setFilteredProperties([]);
          setError(null);
          setLoading(false);
          return;
        }
        
        const propertiesWithImages = await fetchPropertyImages(propertiesData);
        
        console.log("Properties with images:", propertiesWithImages);
        
        setProperties(propertiesWithImages);
        setFilteredProperties(propertiesWithImages);
        setError(null);
      } catch (fetchError: any) {
        console.error("Error in property fetching:", fetchError);
        setError(fetchError.message || "Failed to load properties");
        toast.error("Failed to load properties");
        useSampleProperties();
      }
    } catch (error: any) {
      console.error("Error in useProperties hook:", error);
      setError(error.message || "Failed to load properties");
      toast.error("Failed to load properties");
      useSampleProperties();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      useSampleProperties();
      return;
    }
    
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
    handleRefresh,
    error
  };
}
