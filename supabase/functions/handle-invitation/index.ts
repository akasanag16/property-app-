
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials");
    }
    
    // Create a Supabase client with the service role key for admin privileges
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { action, token, email, userId, propertyId, role, firstName, lastName, password } = await req.json();
    
    // Validate request
    if (!action) {
      throw new Error("Missing required action parameter");
    }
    
    let result;
    
    if (action === "validateToken") {
      // Validate an invitation token
      if (!token || !email) {
        throw new Error("Missing token or email");
      }
      
      result = await validateToken(supabase, token, email);
    } 
    else if (action === "acceptInvitation") {
      // Accept an invitation and set up the account
      if (!token || !email || !userId || !propertyId || !role) {
        throw new Error("Missing required parameters for accepting invitation");
      }
      
      result = await acceptInvitation(supabase, {
        token,
        email,
        userId,
        propertyId,
        role
      });
    }
    else if (action === "createInvitedUser") {
      // Create a user and accept the invitation
      if (!token || !email || !propertyId || !role || !firstName || !lastName || !password) {
        throw new Error("Missing required parameters for creating user");
      }
      
      result = await createInvitedUser(supabase, {
        token,
        email,
        propertyId,
        role,
        firstName,
        lastName,
        password
      });
    }
    else {
      throw new Error("Invalid action");
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in invitation handler:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process invitation" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

async function validateToken(supabase, token, email) {
  // Use the stored procedure to validate the token
  const { data, error } = await supabase.rpc('validate_invitation_token', {
    token,
    email
  });
  
  if (error) throw error;
  
  if (!data || data.length === 0 || !data[0].is_valid) {
    return { valid: false };
  }
  
  return {
    valid: true,
    propertyId: data[0].property_id,
    role: data[0].role
  };
}

async function acceptInvitation(supabase, { token, email, userId, propertyId, role }) {
  // Start a transaction
  const { error: txError } = await supabase.rpc('begin_transaction');
  if (txError) throw txError;
  
  try {
    // 1. Create the appropriate link based on role
    if (role === 'tenant') {
      const { error: linkError } = await supabase
        .from('tenant_property_link')
        .insert({
          tenant_id: userId,
          property_id: propertyId
        });
        
      if (linkError) throw linkError;
      
      // 2. Mark invitation as used
      const { error: updateError } = await supabase
        .from('tenant_invitations')
        .update({ is_used: true })
        .eq('link_token', token)
        .eq('email', email);
        
      if (updateError) throw updateError;
    } 
    else if (role === 'service_provider') {
      const { error: linkError } = await supabase
        .from('service_provider_property_link')
        .insert({
          service_provider_id: userId,
          property_id: propertyId
        });
        
      if (linkError) throw linkError;
      
      // 2. Mark invitation as used
      const { error: updateError } = await supabase
        .from('service_provider_invitations')
        .update({ is_used: true })
        .eq('link_token', token)
        .eq('email', email);
        
      if (updateError) throw updateError;
    } else {
      throw new Error(`Invalid role: ${role}`);
    }
    
    // Commit transaction
    const { error: commitError } = await supabase.rpc('commit_transaction');
    if (commitError) throw commitError;
    
    return { success: true };
  } catch (error) {
    // Rollback on error
    await supabase.rpc('rollback_transaction');
    throw error;
  }
}

async function createInvitedUser(supabase, { token, email, propertyId, role, firstName, lastName, password }) {
  // 1. Create the user with auth
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      role
    }
  });
  
  if (userError) throw userError;
  
  // 2. Accept the invitation with the new user ID
  const result = await acceptInvitation(supabase, {
    token,
    email,
    userId: userData.user.id,
    propertyId,
    role
  });
  
  return {
    ...result,
    userId: userData.user.id
  };
}
