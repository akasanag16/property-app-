
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Tenant } from "@/types/tenant";
import { toast } from "sonner";
import { fetchTenantsForProperties } from "./tenantDataUtils";
import { checkProfileEmailColumn } from "./tenantDataUtils";

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

        console.log("Starting tenant data fetch for owner:", user.id);

        // First check if email column exists
        const hasEmailColumn = await checkProfileEmailColumn();
        setEmailColumnMissing(!hasEmailColumn);
        
        if (!hasEmailColumn) {
          console.warn("Email column is missing from profiles table");
          toast.warning("Database update required: Email column is missing");
        }
        
        // Use the security definer function to get properties
        const { data: propertyData, error: propertiesError } = await supabase
          .rpc('safe_get_owner_properties', { owner_id_param: user.id });
        
        if (propertiesError) {
          console.error("Error fetching owner properties:", propertiesError);
          setError("Failed to retrieve your properties. Please try again.");
          throw propertiesError;
        }
        
        const ownerPropertyIds = propertyData?.map((prop: any) => prop.id) || [];
        console.log(`Owner has ${ownerPropertyIds.length} properties:`, ownerPropertyIds);
        
        if (!ownerPropertyIds || ownerPropertyIds.length === 0) {
          console.log("No properties found for owner");
          setTenants([]);
          setLoading(false);
          return;
        }
        
        try {
          // Fetch tenant data using our improved function
          const allTenants = await fetchTenantsForProperties(ownerPropertyIds);
          console.log(`Fetched ${allTenants.length} tenants for the properties`);
          
          if (allTenants.length === 0) {
            // Only use sample data in development
            if (process.env.NODE_ENV === 'development') {
              console.log("Using sample tenant data in dev mode (no real tenants found)");
              setTenants(sampleTenants);
            } else {
              setTenants([]);
            }
          } else {
            setTenants(allTenants);
          }
        } catch (err: any) {
          console.error("Error in tenant fetching process:", err);
          setError("Failed to load tenants data. The server returned an error.");
          
          // Only fallback to sample data in development mode
          if (process.env.NODE_ENV === 'development') {
            console.log("Using sample tenant data due to fetch error");
            setTenants(sampleTenants);
          }
        }
        
      } catch (error: any) {
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
