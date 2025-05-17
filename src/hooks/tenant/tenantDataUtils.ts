
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
 */
export async function fetchTenantsForProperties(propertyIds: string[]): Promise<Tenant[]> {
  try {
    if (!propertyIds || propertyIds.length === 0) {
      console.log("No property IDs provided to fetchTenantsForProperties");
      return [];
    }
    
    console.log("Fetching tenants for properties:", propertyIds);
    
    // Use direct queries with proper typings instead of RPC to avoid recursion
    // First, get all tenant links directly
    const { data: links, error: linksError } = await supabase
      .from('tenant_property_link')
      .select('tenant_id, property_id')
      .in('property_id', propertyIds);
      
    if (linksError) {
      console.error("Error fetching tenant links:", linksError);
      throw linksError;
    }
    
    if (!links || links.length === 0) {
      console.log("No tenant links found for the provided property IDs");
      return [];
    }
    
    // Extract tenant IDs
    const tenantIds = links.map(link => link.tenant_id);
    
    // Get property names in a separate query to avoid recursion
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, name')
      .in('id', propertyIds);
      
    if (propertiesError) {
      console.error("Error fetching property names:", propertiesError);
      throw propertiesError;
    }
    
    // Create a map of property IDs to property names
    const propertyMap = new Map();
    if (properties && properties.length > 0) {
      properties.forEach(property => {
        propertyMap.set(property.id, property.name);
      });
    }
    
    // Create a map of tenant IDs to their property info
    const tenantToPropertyMap = new Map();
    links.forEach(link => {
      if (link && link.tenant_id) {
        tenantToPropertyMap.set(link.tenant_id, {
          id: link.property_id,
          name: propertyMap.get(link.property_id) || "Unknown Property"
        });
      }
    });
    
    if (tenantIds.length === 0) {
      console.log("No valid tenant IDs found in the links");
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
      console.log("No profiles found for the tenant IDs");
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
      // Continue without payments data - not critical
    }
    
    // Create a map of tenant IDs to their payments
    const tenantPaymentsMap = new Map();
    if (payments && Array.isArray(payments)) {
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
      const property = tenantToPropertyMap.get(profile.id);
      
      // Find payments for this tenant
      const tenantPayments = tenantPaymentsMap.get(profile.id) || [];
      
      // Get the most recent past payment (for "last payment")
      const lastPayment = tenantPayments
        .filter((p: any) => new Date(p.due_date) <= new Date())
        .sort((a: any, b: any) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())[0];
      
      // Get the next upcoming payment
      const nextPayment = tenantPayments
        .filter((p: any) => new Date(p.due_date) >= new Date())
        .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];
      
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
        last_name: profile.last_name || "Unknown",
        email: profile.email || "",
        property: property || { id: "", name: "Unknown Property" },
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
    
    console.log(`Successfully processed ${tenants.length} tenants`);
    return tenants;
  } catch (error) {
    console.error("Error in tenant data processing:", error);
    throw error;
  }
}
