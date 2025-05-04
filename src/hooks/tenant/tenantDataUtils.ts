
import { supabase } from "@/integrations/supabase/client";
import { Tenant } from "@/types/tenant";
import { checkEmailColumnExists } from "./tenantUtils";
import { toast } from "sonner";

/**
 * Fetches tenant profiles and payment data for the given properties
 */
export async function fetchTenantsForProperties(propertyIds: string[]): Promise<Tenant[]> {
  let allTenants: Tenant[] = [];
  
  console.log("Starting to fetch tenants for properties:", propertyIds);
  
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
      
      console.log(`Successfully fetched property data for ${propertyId}:`, propertyData);
      
      // Get tenant links for this property
      const { data: tenantLinks, error: linksError } = await supabase
        .from('tenant_property_link')
        .select('tenant_id')
        .eq('property_id', propertyId);
        
      if (linksError) {
        console.error(`Error fetching tenant links for property ${propertyId}:`, linksError);
        continue;
      }
      
      console.log(`Found ${tenantLinks?.length || 0} tenant links for property ${propertyId}:`, tenantLinks);
      
      if (tenantLinks && tenantLinks.length > 0) {
        const tenantIds = tenantLinks.map(link => link.tenant_id);
        
        console.log(`Fetching profiles for tenant IDs:`, tenantIds);
        
        // Get tenant profiles with a direct query
        const { data: tenantProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', tenantIds);
        
        if (profilesError) {
          console.error("Error fetching tenant profiles:", profilesError);
          continue;
        }
        
        console.log(`Fetched tenant profiles:`, tenantProfiles);
        
        // Only proceed if we have valid profiles data
        if (tenantProfiles && Array.isArray(tenantProfiles)) {
          console.log(`Found ${tenantProfiles.length || 0} tenant profiles for property ${propertyId}`);
          
          // Add tenant to our list with property information
          for (const profile of tenantProfiles) {
            try {
              const tenant = await createTenantWithPaymentInfo(profile, propertyData, propertyId);
              allTenants.push(tenant);
              console.log(`Added tenant to list:`, tenant);
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
  
  console.log(`Total tenants found: ${allTenants.length}`);
  return allTenants;
}

/**
 * Creates a tenant object with payment information
 */
export async function createTenantWithPaymentInfo(profile: any, propertyData: any, propertyId: string): Promise<Tenant> {
  console.log(`Creating tenant object for profile:`, profile);
  
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

/**
 * Checks if the email column exists in the profiles table
 */
export async function checkProfileEmailColumn(): Promise<boolean> {
  return await checkEmailColumnExists(supabase);
}
