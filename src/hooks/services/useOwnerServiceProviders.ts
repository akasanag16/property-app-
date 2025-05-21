
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Type for service providers
export interface ServiceProvider {
  id: string;
  name: string;
  email?: string;
  properties: string[];
}

export const useOwnerServiceProviders = (ownerId: string | undefined) => {
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  useEffect(() => {
    const fetchServiceProviders = async () => {
      if (!ownerId) {
        console.log("No owner ID available, skipping service provider fetch");
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const { providers, error: fetchError } = await fetchOwnerServiceProviders(ownerId);
        
        if (fetchError) {
          setError(fetchError);
          return;
        }
        
        setServiceProviders(providers);
        
      } catch (err: any) {
        console.error("Error in service provider fetching process:", err);
        setError(err.message || "Failed to load service providers");
      } finally {
        setLoading(false);
      }
    };
    
    fetchServiceProviders();
  }, [ownerId, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success("Refreshing service provider list...");
  };

  return {
    serviceProviders,
    loading,
    error,
    handleRefresh
  };
};

export const fetchOwnerServiceProviders = async (ownerId: string) => {
  try {
    console.log("Fetching service providers for owner:", ownerId);
    
    // First get owner properties
    const { data: properties, error: propertiesError } = await supabase
      .rpc('safe_get_owner_properties', { owner_id_param: ownerId });
      
    if (propertiesError) {
      console.error("Error fetching owner properties:", propertiesError);
      return { providers: [], error: "Failed to fetch your properties. Please try again." };
    }
    
    if (!properties || properties.length === 0) {
      console.log("No properties found for owner");
      return { providers: [], error: null };
    }
    
    const propertyIds = properties.map((p: any) => p.id);
    console.log(`Owner has ${propertyIds.length} properties:`, propertyIds);
    
    // Get service provider links - using direct query
    const { data: links, error: linksError } = await supabase
      .from('service_provider_property_link')
      .select('service_provider_id, property_id')
      .in('property_id', propertyIds);
      
    if (linksError) {
      console.error("Error fetching service provider links:", linksError);
      return { providers: [], error: "Failed to fetch service provider associations. Please try again." };
    }
    
    if (!links || links.length === 0) {
      console.log("No service providers assigned to properties");
      return { providers: [], error: null };
    }
    
    console.log(`Found ${links.length} service provider links`);
    
    // Get unique service provider IDs
    const providerIds = [...new Set(links.map(link => link.service_provider_id))];
    console.log(`Found ${providerIds.length} unique service providers:`, providerIds);
    
    // Get profiles for these service providers
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .in('id', providerIds);
      
    if (profilesError) {
      console.error("Error fetching service provider profiles:", profilesError);
      return { providers: [], error: "Failed to fetch service provider details. Please try again." };
    }
    
    if (!profiles || profiles.length === 0) {
      console.log("No service provider profiles found for IDs:", providerIds);
      // Instead of directly querying auth, use an RPC function or check for missing profiles
      const { data: missingProfiles, error: missingError } = await supabase
        .rpc('check_missing_profiles', { user_ids: providerIds })
        .catch(error => {
          console.error("Error checking for missing profiles:", error);
          return { data: null, error };
        });
      
      if (missingProfiles && Array.isArray(missingProfiles) && missingProfiles.length > 0) {
        console.log("Found users without proper profiles:", missingProfiles);
        toast.warning("Some service providers have incomplete profiles");
      }
      
      return { providers: [], error: null };
    }
    
    console.log(`Found ${profiles.length} service provider profiles`);
    
    // Create mapping of property ID to name
    const propertyMap = new Map<string, string>();
    properties.forEach((p: any) => propertyMap.set(p.id, p.name));
    
    // Create service provider objects with their assigned properties
    const providers = profiles.map(profile => {
      const providerLinks = links.filter(link => link.service_provider_id === profile.id);
      const providerProperties = providerLinks.map(link => 
        propertyMap.get(link.property_id) || "Unknown Property"
      );
      
      return {
        id: profile.id,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || "Unknown Name",
        email: profile.email,
        properties: providerProperties
      };
    });
    
    console.log(`Successfully processed ${providers.length} service providers`);
    return { providers, error: null };
    
  } catch (err: any) {
    console.error("Error in service provider fetching process:", err);
    return { providers: [], error: err.message || "Failed to load service providers" };
  }
};
