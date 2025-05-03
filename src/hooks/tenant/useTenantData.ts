
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Tenant } from "@/types/tenant";
import { checkEmailColumnExists } from "@/hooks/tenant/tenantUtils";
import { toast } from "sonner";

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
        const hasEmailColumn = await checkEmailColumnExists(supabase);
        setEmailColumnMissing(!hasEmailColumn);
        
        if (!hasEmailColumn) {
          console.warn("Email column is missing from profiles table");
          toast.warning("Database update required: Email column is missing");
        }
        
        // Get properties owned by this owner
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
        
        console.log("Found properties:", propertyIds);
        
        try {
          const allTenants = await fetchTenantsForProperties(propertyIds);
          console.log("Final tenant list:", allTenants);
          
          // Only use sample data if we have NO tenant data AND we're in development
          if (allTenants.length === 0 && process.env.NODE_ENV === 'development') {
            console.log("No tenant data found, using sample data for development");
            setTenants(sampleTenants);
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
        }
      } finally {
        setLoading(false);
      }
    }

    fetchTenants();
  }, [user, refreshKey]);

  return { tenants, loading, error, emailColumnMissing };
}

async function fetchTenantsForProperties(propertyIds: string[]): Promise<Tenant[]> {
  let allTenants: Tenant[] = [];
  
  for (const propertyId of propertyIds) {
    try {
      // Get property details first
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('id, name')
        .eq('id', propertyId)
        .single();
        
      if (propertyError) {
        console.error(`Error fetching property ${propertyId}:`, propertyError);
        continue;
      }
      
      // Get tenant links for this property using a simpler, direct approach
      const { data: tenantLinks, error: linksError } = await supabase
        .from('tenant_property_link')
        .select('tenant_id')
        .eq('property_id', propertyId);
        
      if (linksError) {
        console.error(`Error fetching tenant links for property ${propertyId}:`, linksError);
        continue;
      }
      
      console.log(`Found ${tenantLinks?.length || 0} tenant links for property ${propertyId}`);
      
      if (tenantLinks && tenantLinks.length > 0) {
        const tenantIds = tenantLinks.map(link => link.tenant_id);
        
        // Get tenant profiles with a direct query
        const { data: tenantProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', tenantIds);
        
        if (profilesError) {
          console.error("Error fetching tenant profiles:", profilesError);
          continue;
        }
        
        // Only proceed if we have valid profiles data
        if (tenantProfiles && Array.isArray(tenantProfiles)) {
          console.log(`Found ${tenantProfiles.length || 0} tenant profiles for property ${propertyId}`);
          
          // Add tenant to our list with property information
          for (const profile of tenantProfiles) {
            try {
              const tenant = await createTenantWithPaymentInfo(profile, propertyData, propertyId);
              allTenants.push(tenant);
            } catch (err) {
              console.error(`Error processing tenant ${profile.id}:`, err);
            }
          }
        }
      }
    } catch (err) {
      console.error(`Error processing property ${propertyId}:`, err);
    }
  }
  
  return allTenants;
}

async function createTenantWithPaymentInfo(profile: any, propertyData: any, propertyId: string): Promise<Tenant> {
  // Get latest payment
  const { data: paymentData, error: paymentError } = await supabase
    .from('tenant_payments')
    .select('*')
    .eq('tenant_id', profile.id)
    .eq('property_id', propertyId)
    .order('due_date', { ascending: false })
    .limit(1)
    .maybeSingle();
    
  if (paymentError) {
    console.log(`No payment data found for tenant ${profile.id}:`, paymentError);
  }
  
  // Format tenant data
  const tenant: Tenant = {
    id: profile.id,
    first_name: profile.first_name || 'Unknown',
    last_name: profile.last_name || 'User',
    property: {
      id: propertyData.id,
      name: propertyData.name
    },
    email: profile.email || '',
  };
  
  // Add payment info if available
  if (paymentData) {
    const now = new Date();
    const dueDate = new Date(paymentData.due_date);
    const dueInDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    tenant.last_payment = {
      amount: paymentData.amount,
      date: paymentData.paid_date || paymentData.due_date,
      status: paymentData.status as 'paid' | 'pending' | 'overdue'
    };
    
    tenant.next_payment = {
      amount: paymentData.amount,
      date: paymentData.due_date,
      due_in_days: dueInDays
    };
  }
  
  return tenant;
}
