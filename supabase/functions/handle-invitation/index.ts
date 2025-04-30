
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    const requestData = await req.json()
    const { action, token, email } = requestData
    
    if (!action) {
      throw new Error("Missing required action parameter")
    }
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Processing invitation request: ${action}`)

    // Handle token validation
    if (action === 'validateToken') {
      if (!token || !email) {
        throw new Error("Missing token or email")
      }

      console.log(`Validating token for email: ${email}`)

      // Check both tenant and service provider invitation tables
      const tablesToCheck = ['tenant_invitations', 'service_provider_invitations']
      let validInvitation = null
      let propertyId = null
      let role = null

      for (const table of tablesToCheck) {
        const { data, error } = await supabaseClient
          .from(table)
          .select('*')
          .eq('link_token', token)
          .eq('email', email)
          .eq('is_used', false)
          .gt('expires_at', new Date().toISOString())
          .maybeSingle()

        if (error) {
          console.error(`Error checking ${table}:`, error)
          throw error
        }
        
        if (data) {
          validInvitation = data
          propertyId = data.property_id
          role = table === 'tenant_invitations' ? 'tenant' : 'service_provider'
          console.log(`Found valid invitation in ${table}`)
          break
        }
      }

      if (!validInvitation) {
        console.log('No valid invitation found')
        return new Response(
          JSON.stringify({ valid: false, message: "Invalid or expired invitation" }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          valid: true, 
          propertyId, 
          role,
          email,
          token,
          invitationId: validInvitation.id
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }
    
    // Handle creating an invited user
    if (action === 'createInvitedUser') {
      const { token, email, propertyId, role, firstName, lastName, password } = requestData
      
      if (!token || !email || !propertyId || !role || !firstName || !lastName || !password) {
        const missingParams = [];
        if (!token) missingParams.push('token');
        if (!email) missingParams.push('email');
        if (!propertyId) missingParams.push('propertyId');
        if (!role) missingParams.push('role');
        if (!firstName) missingParams.push('firstName');
        if (!lastName) missingParams.push('lastName');
        if (!password) missingParams.push('password');
        
        console.error("Missing parameters:", missingParams);
        throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
      }

      console.log(`Creating new user for invitation: ${email} as ${role}`);
      console.log(`Property ID: ${propertyId}`);
      console.log(`First name: ${firstName}, Last name: ${lastName}`);

      // Check if user already exists
      const { data: existingUser, error: existingUserError } = await supabaseClient.auth.admin.getUserByEmail(email);
      
      if (existingUser && existingUser.user) {
        console.log(`User with email ${email} already exists`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "A user with this email address has already been registered" 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      // Begin transaction
      const tableName = role === 'tenant' ? 'tenant_invitations' : 'service_provider_invitations';
      const linkTableName = role === 'tenant' ? 'tenant_property_link' : 'service_provider_property_link';
      
      try {
        // 1. Create the user account
        const { data: authUser, error: userError } = await supabaseClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
            role
          }
        });

        if (userError) {
          console.error('Error creating user:', userError);
          throw userError;
        }

        if (!authUser || !authUser.user) {
          throw new Error("Failed to create user account");
        }

        console.log(`User created with ID: ${authUser.user.id}`);

        // 2. Mark invitation as used
        const { error: inviteError } = await supabaseClient
          .from(tableName)
          .update({ 
            is_used: true,
            status: 'accepted',
            accepted_at: new Date().toISOString(),
            accepted_by_user_id: authUser.user.id
          })
          .eq('link_token', token)
          .eq('email', email);

        if (inviteError) {
          console.error('Error updating invitation:', inviteError);
          throw inviteError;
        }

        // 3. Create property link
        const linkData: any = {
          property_id: propertyId,
        };
        
        if (role === 'tenant') {
          linkData.tenant_id = authUser.user.id;
        } else {
          linkData.service_provider_id = authUser.user.id;
        }

        const { error: linkError } = await supabaseClient
          .from(linkTableName)
          .insert(linkData);

        if (linkError) {
          console.error('Error creating property link:', linkError);
          throw linkError;
        }

        console.log('User successfully created and linked to property');

        return new Response(
          JSON.stringify({ success: true }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      } catch (error: any) {
        console.error('Transaction error:', error);
        
        // Check if this is an email_exists error
        if (error.code === "email_exists" || 
            (error.message && error.message.includes("already been registered"))) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "A user with this email address has already been registered"
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            error: error.message || "Error processing invitation",
            details: JSON.stringify(error)
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }
    }

    throw new Error('Invalid action: ' + action);
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unknown error occurred",
        details: error.stack || ""
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
