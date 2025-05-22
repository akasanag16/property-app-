
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useOwnerInvitations } from "../invitations/useOwnerInvitations";
import { User } from "@supabase/supabase-js";

// Type for service providers
export interface ServiceProvider {
  id: string;
  name: string;
  email?: string;
  properties: string[];
}

// Define a type for the API response
interface ServiceProviderDetails {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  property_id: string;
  property_name: string;
}

export const useOwnerServiceProviders = (ownerId: string | undefined) => {
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Get service provider invitations
  const user = useMemo(() => ownerId ? { id: ownerId } as User : null, [ownerId]);
  const {
    invitations: serviceProviderInvitations,
    loading: invitationsLoading,
    error: invitationsError,
    resendingId,
    handleResendInvitation
  } = useOwnerInvitations(user, 'service_provider', refreshKey);
  
  useEffect(() => {
    const fetchServiceProviders = async () => {
      if (!ownerId) {
        console.log("No owner ID available, skipping service provider fetch");
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Using the RPC function with proper type checking
        const { data, error: fetchError } = await supabase
          .rpc('get_owner_service_providers_with_details', { 
            owner_id_param: ownerId 
          });
        
        if (fetchError) {
          console.error("Error fetching service providers:", fetchError);
          setError("Failed to load service providers. Please try again.");
          setServiceProviders([]);
          return;
        }
        
        if (!data || data.length === 0) {
          console.log("No service providers found for this owner");
          setServiceProviders([]);
          return;
        }
        
        // Process the data - this is now more efficient as the database did most of the work
        const providersMap = new Map<string, ServiceProvider>();
        
        (data as ServiceProviderDetails[]).forEach((item: ServiceProviderDetails) => {
          const provider = providersMap.get(item.id);
          
          if (provider) {
            // Add property to existing provider if it's not already there
            if (!provider.properties.includes(item.property_name)) {
              provider.properties.push(item.property_name);
            }
          } else {
            // Create new provider entry
            providersMap.set(item.id, {
              id: item.id,
              name: `${item.first_name || ''} ${item.last_name || ''}`.trim() || "Unknown Name",
              email: item.email || undefined,
              properties: item.property_name ? [item.property_name] : []
            });
          }
        });
        
        setServiceProviders(Array.from(providersMap.values()));
        
      } catch (err: any) {
        console.error("Error in service provider fetching process:", err);
        setError(err.message || "Failed to load service providers");
        setServiceProviders([]);
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
    handleRefresh,
    serviceProviderInvitations,
    invitationsLoading,
    invitationsError,
    resendingId,
    handleResendInvitation
  };
};
