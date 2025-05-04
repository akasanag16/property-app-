
import { supabase } from "@/integrations/supabase/client";
import { Tenant } from "@/types/tenant";

/**
 * Check if the email column exists in the profiles table
 */
export async function checkProfileEmailColumn() {
  try {
    // Try to select the email column from any profile
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(1);
      
    if (error) {
      console.warn('Error checking for email column:', error.message);
      // Check if the error message indicates the column doesn't exist
      if (error.message.includes("column \"email\" does not exist") ||
          error.message.includes("does not exist in the current schema")) {
        return false;
      }
      // For other errors, assume column might exist but there's another issue
      return false;
    }
    
    // If we got here without errors, the column exists
    return true;
  } catch (error) {
    console.error('Error checking email column:', error);
    return false;
  }
}

/**
 * Fetch tenants for a list of property IDs
 */
export async function fetchTenantsForProperties(propertyIds: string[]): Promise<Tenant[]> {
  try {
    // Get all tenants linked to these properties
    const { data: tenantLinks, error: tenantLinksError } = await supabase
      .from('tenant_property_link')
      .select(`
        id,
        tenant_id,
        property_id,
        properties:property_id (
          id,
          name,
          address
        )
      `)
      .in('property_id', propertyIds);
      
    if (tenantLinksError) {
      console.error("Error fetching tenant links:", tenantLinksError);
      throw tenantLinksError;
    }
    
    if (!tenantLinks || tenantLinks.length === 0) {
      return [];
    }
    
    // Extract tenant IDs to fetch their profiles
    const tenantIds = tenantLinks.map(link => link.tenant_id);
    
    // Fetch profile data for these tenants
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', tenantIds);
      
    if (profilesError) {
      console.error("Error fetching tenant profiles:", profilesError);
      throw profilesError;
    }
    
    // Fetch payment data for these tenants
    const { data: payments, error: paymentsError } = await supabase
      .from('tenant_payments')
      .select('*')
      .in('tenant_id', tenantIds)
      .order('due_date', { ascending: false });
      
    if (paymentsError) {
      console.error("Error fetching tenant payments:", paymentsError);
      throw paymentsError;
    }
    
    // Process the data to create tenant objects
    const tenants: Tenant[] = tenantLinks.map(link => {
      // Find the profile for this tenant
      const profile = profiles?.find(p => p.id === link.tenant_id);
      
      if (!profile) {
        console.warn(`No profile found for tenant ID: ${link.tenant_id}`);
        return null;
      }
      
      // Get the most recent past payment (for "last payment")
      const lastPayment = payments
        ?.filter(p => p.tenant_id === link.tenant_id && new Date(p.due_date) <= new Date())
        .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())[0];
      
      // Get the next upcoming payment
      const nextPayment = payments
        ?.filter(p => p.tenant_id === link.tenant_id && new Date(p.due_date) >= new Date())
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];
      
      // Calculate days until next payment
      const daysUntilNext = nextPayment 
        ? Math.ceil((new Date(nextPayment.due_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
        : null;
      
      // Build the tenant object
      return {
        id: profile.id,
        first_name: profile.first_name || "Unknown",
        last_name: profile.last_name || "Tenant",
        email: profile.email || null,
        property: link.properties || { name: "Unknown", id: link.property_id, address: "Unknown" },
        last_payment: lastPayment ? {
          date: lastPayment.due_date,
          status: lastPayment.status,
          amount: lastPayment.amount
        } : null,
        next_payment: nextPayment ? {
          date: nextPayment.due_date,
          amount: nextPayment.amount,
          due_in_days: daysUntilNext
        } : null
      };
    }).filter(tenant => tenant !== null) as Tenant[];
    
    return tenants;
  } catch (error) {
    console.error("Error in tenant data processing:", error);
    throw error;
  }
}
