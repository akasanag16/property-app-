
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
 * Fetch tenants for a list of property IDs using direct queries
 * and our new security definer functions
 */
export async function fetchTenantsForProperties(propertyIds: string[]): Promise<Tenant[]> {
  try {
    if (!propertyIds || propertyIds.length === 0) {
      return [];
    }
    
    // Use a direct REST call to execute the function since TypeScript doesn't know about it yet
    const { data: tenantLinks, error: tenantLinksError } = await supabase
      .from('rpc')
      .select('*')
      .eq('name', 'get_tenant_property_links_for_properties')
      .eq('args', { property_ids: propertyIds });
      
    if (tenantLinksError) {
      console.error("Error fetching tenant links:", tenantLinksError);
      throw tenantLinksError;
    }
    
    if (!tenantLinks || !Array.isArray(tenantLinks) || tenantLinks.length === 0) {
      return [];
    }
    
    // Extract tenant IDs from the links
    const tenantIds = [];
    const propertyMap = new Map();
    const tenantPropertyMap = new Map();
    
    // Process the array, assuming the response structure
    const processedLinks = tenantLinks[0].result || [];
    
    if (!Array.isArray(processedLinks) || processedLinks.length === 0) {
      return [];
    }
    
    // Now process each link in the array
    for (const link of processedLinks) {
      if (link.tenant_id) {
        tenantIds.push(link.tenant_id);
        
        // Map property info
        propertyMap.set(link.property_id, {
          id: link.property_id,
          name: link.property_name || "Unknown Property"
        });
        
        // Map tenant to property
        tenantPropertyMap.set(link.tenant_id, {
          id: link.property_id,
          name: link.property_name || "Unknown Property"
        });
      }
    }
    
    if (tenantIds.length === 0) {
      return [];
    }
    
    // Fetch profile data for these tenants
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .in('id', tenantIds);
      
    if (profilesError) {
      console.error("Error fetching tenant profiles:", profilesError);
      throw profilesError;
    }
    
    if (!profiles || profiles.length === 0) {
      return [];
    }
    
    // Fetch payment data for these tenants
    const { data: payments, error: paymentsError } = await supabase
      .from('tenant_payments')
      .select('tenant_id, due_date, amount, status, paid_date')
      .in('tenant_id', tenantIds)
      .order('due_date', { ascending: false });
      
    if (paymentsError) {
      console.error("Error fetching tenant payments:", paymentsError);
      throw paymentsError;
    }
    
    // Create a map of tenant IDs to their payments
    const tenantPaymentsMap = new Map();
    if (payments) {
      payments.forEach(payment => {
        if (!tenantPaymentsMap.has(payment.tenant_id)) {
          tenantPaymentsMap.set(payment.tenant_id, []);
        }
        tenantPaymentsMap.get(payment.tenant_id).push(payment);
      });
    }
    
    // Process the data to create tenant objects
    const tenants: Tenant[] = profiles.map(profile => {
      // Get property from the map
      const property = tenantPropertyMap.get(profile.id);
      
      // Find payments for this tenant
      const tenantPayments = tenantPaymentsMap.get(profile.id) || [];
      
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
      
      // Map the payment status to the allowed types in the Tenant interface
      let paymentStatus: 'paid' | 'pending' | 'overdue' = 'pending';
      if (lastPayment) {
        if (lastPayment.status === 'paid') paymentStatus = 'paid';
        else if (lastPayment.status === 'overdue') paymentStatus = 'overdue';
        else paymentStatus = 'pending';
      }
      
      // Build the tenant object
      return {
        id: profile.id,
        first_name: profile.first_name || "Unknown",
        last_name: profile.last_name || "Tenant",
        email: profile.email || "",
        property: property,
        last_payment: lastPayment ? {
          date: lastPayment.due_date,
          status: paymentStatus,
          amount: lastPayment.amount
        } : undefined,
        next_payment: nextPayment ? {
          date: nextPayment.due_date,
          amount: nextPayment.amount,
          due_in_days: daysUntilNext
        } : undefined
      };
    });
    
    return tenants;
  } catch (error) {
    console.error("Error in tenant data processing:", error);
    throw error;
  }
}
