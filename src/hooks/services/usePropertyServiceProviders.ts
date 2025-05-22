
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
        
        // Get service provider links for this property
        const { data: spLinks, error: spLinksError } = await supabase
          .from('service_provider_property_link')
          .select('service_provider_id')
          .eq('property_id', propertyId);
        
        if (spLinksError) {
          console.error("Error fetching service provider links:", spLinksError);
          setError("Failed to fetch service provider data. Please try again.");
          return;
        }
        
        if (!spLinks || spLinks.length === 0) {
          console.log("No service providers assigned to this property");
          setServiceProviders([]);
          return;
        }
        
        // Get unique service provider IDs
        const providerIds = spLinks.map((link) => link.service_provider_id);
        
        // Get profiles for these service providers
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', providerIds);
          
        if (profilesError) {
          console.error("Error fetching service provider profiles:", profilesError);
          setError("Failed to fetch service provider details. Please try again.");
          return;
        }
        
        // Format service provider data
        const providers: ServiceProvider[] = profiles ? profiles.map(profile => ({
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || "Unknown Name",
          email: profile.email,
          properties: [propertyId] // We only care about this property in this context
        })) : [];
        
        setServiceProviders(providers);
        
      } catch (err: any) {
        console.error("Error in service provider fetching process:", err);
        setError(err.message || "Failed to load service providers");
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
