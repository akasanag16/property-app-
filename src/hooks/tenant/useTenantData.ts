
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Tenant } from "@/types/tenant";
import { toast } from "sonner";
import { fetchTenantsForOwner, checkProfileEmailColumn } from "./tenantDataUtils";

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
        
        // Use our improved tenant fetching function that avoids recursion
        try {
          const allTenants = await fetchTenantsForOwner(user.id);
          console.log(`Fetched ${allTenants.length} tenants for the owner`);
          
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
          setError(`Failed to load tenants data: ${err.message || "Unknown error"}`);
          
          // Only fallback to sample data in development mode
          if (process.env.NODE_ENV === 'development') {
            console.log("Using sample tenant data due to fetch error");
            setTenants(sampleTenants);
          }
        }
        
      } catch (error: any) {
        console.error("Error fetching tenants:", error);
        setError(`Failed to load tenants: ${error.message || "Unknown error"}`);
        
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
