
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
    
    // Use the security definer function to get owner properties
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
    
    // Use our new secure function to get service provider data without recursion
    const { data: spData, error: spError } = await supabase
      .rpc('safe_get_owner_service_providers', { owner_id_param: ownerId });
    
    if (spError) {
      console.error("Error fetching service provider data:", spError);
      return { providers: [], error: "Failed to fetch service provider data. Please try again." };
    }
    
    if (!spData || spData.length === 0) {
      console.log("No service providers assigned to properties");
      return { providers: [], error: null };
    }
    
    // Get unique service provider IDs
    const providerIds = [...new Set(spData.map((item: any) => item.service_provider_id))];
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
    
    // Create mapping of property ID to name from the spData
    const propertyMap = new Map<string, string>();
    spData.forEach((item: any) => propertyMap.set(item.property_id, item.property_name));
    
    // Create service provider objects with their assigned properties
    const providers: ServiceProvider[] = [];
    
    if (profiles && profiles.length > 0) {
      profiles.forEach(profile => {
        // Find all property links for this service provider
        const providerProperties = spData
          .filter((item: any) => item.service_provider_id === profile.id)
          .map((item: any) => item.property_name || "Unknown Property");
        
        providers.push({
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || "Unknown Name",
          email: profile.email,
          properties: providerProperties
        });
      });
    }
    
    // Check for missing profiles
    const foundProfileIds = profiles ? profiles.map(p => p.id) : [];
    const missingProfileIds = providerIds.filter(id => !foundProfileIds.includes(id));
    
    if (missingProfileIds.length > 0) {
      console.log("Found users without proper profiles:", missingProfileIds);
      toast.warning("Some service providers have incomplete profiles");
    }
    
    console.log(`Successfully processed ${providers.length} service providers`);
    return { providers, error: null };
    
  } catch (err: any) {
    console.error("Error in service provider fetching process:", err);
    return { providers: [], error: err.message || "Failed to load service providers" };
  }
};
