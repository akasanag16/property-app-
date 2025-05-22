
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ServiceProvider } from "@/hooks/services/useOwnerServiceProviders";

export const usePropertyServiceProviders = (propertyId: string | undefined) => {
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchServiceProviders = async () => {
      if (!propertyId) {
        console.log("No property ID available, skipping service provider fetch");
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching service providers for property:", propertyId);
        
        // Use the safe RPC function to fetch service providers for this property
        const { data: providers, error: providersError } = await supabase
          .rpc('safe_get_property_service_providers', { 
            property_id_param: propertyId 
          });
        
        if (providersError) {
          console.error("Error fetching service providers:", providersError);
          setError("Failed to fetch service provider data. Please try again.");
          setServiceProviders([]);
          return;
        }
        
        console.log("Fetched service providers:", providers);
        
        if (!providers || providers.length === 0) {
          console.log("No service providers found for this property");
          setServiceProviders([]);
          return;
        }
        
        // Format service provider data
        const formattedProviders: ServiceProvider[] = providers.map(provider => ({
          id: provider.id,
          name: `${provider.first_name || ''} ${provider.last_name || ''}`.trim() || "Unknown Name",
          email: provider.email,
          properties: [propertyId] // We only care about this property in this context
        }));
        
        setServiceProviders(formattedProviders);
        
      } catch (err: any) {
        console.error("Error in service provider fetching process:", err);
        setError(err.message || "Failed to load service providers");
        setServiceProviders([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchServiceProviders();
  }, [propertyId]);

  return {
    serviceProviders,
    loading,
    error
  };
};
