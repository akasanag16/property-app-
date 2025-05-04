
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
 * Fetch tenants for a list of property IDs using a direct query approach
 * that avoids potential recursion issues with RLS policies
 */
export async function fetchTenantsForProperties(propertyIds: string[]): Promise<Tenant[]> {
  try {
    // 1. First fetch tenant-property links directly
    const { data: tenantLinks, error: tenantLinksError } = await supabase
      .rpc('get_tenant_property_links_for_properties', { property_ids: propertyIds });
      
    if (tenantLinksError) {
      console.error("Error fetching tenant links:", tenantLinksError);
      throw tenantLinksError;
    }
    
    if (!tenantLinks || tenantLinks.length === 0) {
      return [];
    }
    
    // 2. Extract tenant IDs and property info
    const tenantIds = tenantLinks.map(link => link.tenant_id);
    const propertyMap = new Map();
    
    tenantLinks.forEach(link => {
      propertyMap.set(link.tenant_id, {
        id: link.property_id,
        name: link.property_name || "Unknown Property"
      });
    });
    
    // 3. Fetch profile data for these tenants
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .in('id', tenantIds);
      
    if (profilesError) {
      console.error("Error fetching tenant profiles:", profilesError);
      throw profilesError;
    }
    
    // 4. Fetch payment data for these tenants
    const { data: payments, error: paymentsError } = await supabase
      .from('tenant_payments')
      .select('tenant_id, due_date, amount, status, paid_date')
      .in('tenant_id', tenantIds)
      .order('due_date', { ascending: false });
      
    if (paymentsError) {
      console.error("Error fetching tenant payments:", paymentsError);
      throw paymentsError;
    }
    
    // 5. Process the data to create tenant objects
    const tenants: Tenant[] = profiles.map(profile => {
      // Get property from the map
      const property = propertyMap.get(profile.id) || { id: "unknown", name: "Unknown Property" };
      
      // Find payments for this tenant
      const tenantPayments = payments.filter(p => p.tenant_id === profile.id);
      
      // Get the most recent past payment (for "last payment")
      const lastPayment = tenantPayments
        .filter(p => new Date(p.due_date) <= new Date())
        .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())[0];
      
      // Get the next upcoming payment
      const nextPayment = tenantPayments
        .filter(p => new Date(p.due_date) >= new Date())
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
        property: property,
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
    });
    
    return tenants;
  } catch (error) {
    console.error("Error in tenant data processing:", error);
    throw error;
  }
}
