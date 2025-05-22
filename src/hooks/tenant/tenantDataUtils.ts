
import { supabase } from "@/integrations/supabase/client";
import { Tenant } from "@/types/tenant";
import { toast } from "sonner";
import { addDays, differenceInDays } from "date-fns";

// Check if email column exists in profiles table
export async function checkProfileEmailColumn() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .limit(1);
      
    if (error) {
      console.error("Error checking email column:", error);
      return false;
    }
    
    // If we can run this query successfully, email column exists
    return true;
  } catch (error) {
    console.error("Error checking email column:", error);
    return false;
  }
}

// Fetch tenants for the given owner
export async function fetchTenantsForOwner(ownerId: string): Promise<Tenant[]> {
  try {
    console.log(`Fetching tenants for owner: ${ownerId}`);
    
    if (!ownerId) {
      console.error("No owner ID provided");
      throw new Error("Authentication required to fetch tenants");
    }
    
    // Use our new security definer function to avoid recursion
    const { data: tenantLinks, error: tenantLinksError } = await supabase
      .rpc('safe_get_tenant_property_links', { owner_id_param: ownerId });
    
    if (tenantLinksError) {
      console.error("Error fetching tenant links:", tenantLinksError);
      throw tenantLinksError;
    }
    
    if (!tenantLinks || tenantLinks.length === 0) {
      console.log("No tenant links found for this owner");
      return [];
    }
    
    // Extract unique tenant IDs
    const tenantIds = [...new Set(tenantLinks.map((link: any) => link.tenant_id))];
    console.log(`Found ${tenantIds.length} unique tenants`);
    
    // Create property map
    const propertyMap = new Map<string, string>();
    tenantLinks.forEach((link: any) => {
      propertyMap.set(link.property_id, link.property_name);
    });
    
    // Fetch tenant profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .in('id', tenantIds as string[]);
      
    if (profilesError) {
      console.error("Error fetching tenant profiles:", profilesError);
      throw profilesError;
    }
    
    // Fetch latest payments for each tenant
    const { data: payments, error: paymentsError } = await supabase
      .from('tenant_payments')
      .select('tenant_id, amount, due_date, paid_date, status')
      .in('tenant_id', tenantIds as string[])
      .order('due_date', { ascending: false });
      
    if (paymentsError) {
      console.error("Error fetching tenant payments:", paymentsError);
      // Continue without payments data
    }
    
    // Build payment map (latest payment per tenant)
    const paymentMap = new Map();
    if (payments) {
      payments.forEach((payment: any) => {
        if (!paymentMap.has(payment.tenant_id)) {
          paymentMap.set(payment.tenant_id, payment);
        }
      });
    }
    
    // Find tenant's property from links
    const tenantPropertyMap = new Map();
    if (tenantLinks) {
      tenantLinks.forEach((link: any) => {
        tenantPropertyMap.set(link.tenant_id, {
          id: link.property_id,
          name: link.property_name || "Unknown Property"
        });
      });
    }
    
    // Create tenant objects
    const tenants: Tenant[] = [];
    if (profiles) {
      profiles.forEach(profile => {
        // Find tenant's property from our map
        const propertyInfo = tenantPropertyMap.get(profile.id);
        
        const paymentInfo = paymentMap.get(profile.id);
        
        // Calculate days until next payment is due
        let dueInDays = 0;
        if (paymentInfo && paymentInfo.due_date) {
          const dueDate = new Date(paymentInfo.due_date);
          const today = new Date();
          dueInDays = differenceInDays(dueDate, today);
        }
        
        tenants.push({
          id: profile.id,
          first_name: profile.first_name || "Unknown",
          last_name: profile.last_name || "",
          email: profile.email || null,
          property: propertyInfo || null,
          last_payment: paymentInfo ? {
            date: paymentInfo.paid_date,
            amount: paymentInfo.amount,
            status: paymentInfo.status
          } : null,
          next_payment: paymentInfo ? {
            date: paymentInfo.due_date,
            amount: paymentInfo.amount,
            due_in_days: dueInDays
          } : null
        });
      });
    }
    
    console.log(`Successfully processed ${tenants.length} tenants`);
    return tenants;
    
  } catch (error: any) {
    console.error("Error in tenant data processing:", error);
    throw error;
  }
}
