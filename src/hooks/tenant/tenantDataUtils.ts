
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

// Fetch tenants for the given owner using our new function
export async function fetchTenantsForOwner(ownerId: string): Promise<Tenant[]> {
  try {
    console.log(`Fetching tenants for owner: ${ownerId}`);
    
    if (!ownerId) {
      console.error("No owner ID provided");
      throw new Error("Authentication required to fetch tenants");
    }

    // Use our new function that returns only actual tenants (with accepted invitations)
    const { data: tenantsData, error: tenantsError } = await supabase
      .rpc('get_owner_tenants_with_details', { owner_id_param: ownerId });
    
    if (tenantsError) {
      console.error("Error fetching tenants:", tenantsError);
      throw tenantsError;
    }
    
    if (!tenantsData || tenantsData.length === 0) {
      console.log("No tenants found for this owner");
      return [];
    }
    
    console.log(`Found ${tenantsData.length} tenants`);

    // Process and transform the data into our Tenant type
    const tenantMap = new Map<string, Tenant>();
    
    tenantsData.forEach((tenantData: any) => {
      const existingTenant = tenantMap.get(tenantData.id);
      
      // Calculate days until next payment is due
      let dueInDays = 0;
      if (tenantData.next_payment_date) {
        const dueDate = new Date(tenantData.next_payment_date);
        const today = new Date();
        dueInDays = differenceInDays(dueDate, today);
      }
      
      if (existingTenant) {
        // Add property to existing tenant if it's not already in their properties array
        if (!existingTenant.properties.some(prop => prop.id === tenantData.property_id)) {
          existingTenant.properties.push({
            id: tenantData.property_id,
            name: tenantData.property_name || "Unknown Property"
          });
        }
      } else {
        // Create new tenant entry
        tenantMap.set(tenantData.id, {
          id: tenantData.id,
          first_name: tenantData.first_name || "Unknown",
          last_name: tenantData.last_name || "",
          email: tenantData.email || null,
          properties: [{
            id: tenantData.property_id,
            name: tenantData.property_name || "Unknown Property"
          }],
          last_payment: tenantData.last_payment_date ? {
            amount: tenantData.payment_amount,
            date: tenantData.last_payment_date,
            status: tenantData.payment_status || 'pending'
          } : null,
          next_payment: tenantData.next_payment_date ? {
            amount: tenantData.payment_amount,
            date: tenantData.next_payment_date,
            due_in_days: dueInDays
          } : null
        });
      }
    });
    
    console.log(`Successfully processed ${tenantMap.size} tenants`);
    return Array.from(tenantMap.values());
    
  } catch (error: any) {
    console.error("Error in tenant data processing:", error);
    throw error;
  }
}
