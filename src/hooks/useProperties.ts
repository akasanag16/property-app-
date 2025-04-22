
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
  image_url?: string | null;
};

export function useProperties(userId?: string) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching properties for user:", userId);
      
      if (!userId) {
        console.log("No user ID provided, using sample data");
        useSampleProperties();
        return;
      }
      
      // First get the role of the user to determine the query approach
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error("Error fetching user role:", profileError);
        useSampleProperties();
        return;
      }
      
      const userRole = profileData?.role;
      console.log("User role:", userRole);
      
      let propertiesData: Property[] = [];
      
      if (userRole === 'tenant') {
        // For tenants, first get the property IDs they have access to
        const { data: propertyIds, error: linkError } = await supabase
          .rpc('get_tenant_properties', { tenant_id: userId });
          
        if (linkError) {
          console.error("Error getting tenant properties:", linkError);
          throw linkError;
        }
        
        if (!propertyIds || propertyIds.length === 0) {
          console.log("No properties found for tenant");
          setProperties([]);
          setFilteredProperties([]);
          setLoading(false);
          return;
        }
        
        // Then fetch those properties directly
        const { data: properties, error: propertiesError } = await supabase
          .from('properties')
          .select(`
            id,
            name,
            address,
            details
          `)
          .in('id', propertyIds);
          
        if (propertiesError) {
          console.error("Error fetching properties by IDs:", propertiesError);
          throw propertiesError;
        }
        
        propertiesData = properties || [];
      } else if (userRole === 'owner') {
        // For owners, just fetch their properties directly
        const { data: properties, error: propertiesError } = await supabase
          .from('properties')
          .select(`
            id,
            name,
            address,
            details
          `)
          .eq('owner_id', userId);
          
        if (propertiesError) {
          console.error("Error fetching owner properties:", propertiesError);
          throw propertiesError;
        }
        
        propertiesData = properties || [];
      } else if (userRole === 'service_provider') {
        // For service providers, use a similar approach as tenants
        const { data: propertyIds, error: linkError } = await supabase
          .rpc('get_service_provider_properties', { provider_id: userId });
          
        if (linkError) {
          console.error("Error getting service provider properties:", linkError);
          throw linkError;
        }
        
        if (!propertyIds || propertyIds.length === 0) {
          console.log("No properties found for service provider");
          setProperties([]);
          setFilteredProperties([]);
          setLoading(false);
          return;
        }
        
        const { data: properties, error: propertiesError } = await supabase
          .from('properties')
          .select(`
            id,
            name,
            address,
            details
          `)
          .in('id', propertyIds);
          
        if (propertiesError) {
          console.error("Error fetching properties by IDs:", propertiesError);
          throw propertiesError;
        }
        
        propertiesData = properties || [];
      }
      
      // Now fetch images for each property
      for (const property of propertiesData) {
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
      
      console.log("Fetched properties:", propertiesData);
      setProperties(propertiesData);
      setFilteredProperties(propertiesData);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching properties:", error);
      setError(error.message || "Failed to load properties");
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
    setError(null);
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
