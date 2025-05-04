
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Tenant } from "@/types/tenant";
import { toast } from "sonner";
import { fetchTenantsForProperties, checkProfileEmailColumn } from "./tenantDataUtils";

// Fallback to sample data if needed for development/testing
import { sampleTenants } from "@/data/sampleTenants";

export function useTenantData(user: User | null, refreshKey: number) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailColumnMissing, setEmailColumnMissing] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    async function fetchTenants() {
      try {
        setLoading(true);
        setError(null);
        
        if (!user?.id) {
          console.error("No user ID available to fetch tenants");
          return;
        }

        // First check if email column exists
        const hasEmailColumn = await checkProfileEmailColumn();
        setEmailColumnMissing(!hasEmailColumn);
        
        if (!hasEmailColumn) {
          console.warn("Email column is missing from profiles table");
          toast.warning("Database update required: Email column is missing");
        }
        
        // Use the safer RPC function to get properties
        const { data: propertyIds, error: propertiesError } = await supabase
          .rpc('get_owner_properties', { owner_id_param: user.id });
        
        if (propertiesError) {
          console.error("Error fetching owner properties:", propertiesError);
          setError("Failed to retrieve properties. Please try again.");
          throw propertiesError;
        }
        
        if (!propertyIds || propertyIds.length === 0) {
          console.log("No properties found for owner");
          setTenants([]);
          setLoading(false);
          return;
        }
        
        try {
          const allTenants = await fetchTenantsForProperties(propertyIds);
          
          if (allTenants.length === 0) {
            // Only use sample data if we're in development
            if (process.env.NODE_ENV === 'development') {
              setTenants(sampleTenants);
            } else {
              setTenants([]);
            }
          } else {
            setTenants(allTenants);
          }
        } catch (err) {
          console.error("Error in tenant fetching process:", err);
          setError("Failed to load tenants data.");
          
          // Only fallback to sample data in development mode
          if (process.env.NODE_ENV === 'development') {
            console.log("Using sample tenant data due to fetch error");
            setTenants(sampleTenants);
          }
        }
        
      } catch (error) {
        console.error("Error fetching tenants:", error);
        setError("Failed to load tenants. Please try again.");
        
        // Only fallback to sample data in development mode
        if (process.env.NODE_ENV === 'development') {
          toast.error("Failed to load tenants");
          setTenants(sampleTenants);
        } else {
          setTenants([]);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchTenants();
  }, [user, refreshKey]);

  return { tenants, loading, error, emailColumnMissing };
}
