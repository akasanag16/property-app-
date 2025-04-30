
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
      let invitationType = null

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
          invitationType = table === 'tenant_invitations' ? 'tenant' : 'service_provider'
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
          invitationType,
          invitationId: validInvitation.id
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }
    
    // Handle creating an invited user or linking existing user
    if (action === 'createInvitedUser') {
      const { token, email, propertyId, role, firstName, lastName, password } = requestData
      
      if (!token || !email || !propertyId || !role) {
        const missingParams = [];
        if (!token) missingParams.push('token');
        if (!email) missingParams.push('email');
        if (!propertyId) missingParams.push('propertyId');
        if (!role) missingParams.push('role');
        
        console.error("Missing parameters:", missingParams);
        throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
      }

      console.log(`Processing invitation for: ${email} as ${role}`);
      console.log(`Property ID: ${propertyId}`);

      // Check if user already exists
      const { data: existingUser, error: existingUserError } = await supabaseClient.auth.admin.getUserByEmail(email);
      
      // Begin transaction
      const tableName = role === 'tenant' ? 'tenant_invitations' : 'service_provider_invitations';
      const linkTableName = role === 'tenant' ? 'tenant_property_link' : 'service_provider_property_link';
      
      try {
        let userId;

        if (existingUser && existingUser.user) {
          console.log(`User with email ${email} already exists - linking to property instead`);
          userId = existingUser.user.id;
        } else {
          // If user doesn't exist, create new user account
          if (!firstName || !lastName || !password) {
            throw new Error("Missing required parameters for creating a new user");
          }

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

          console.log(`New user created with ID: ${authUser.user.id}`);
          userId = authUser.user.id;
        }

        // 2. Mark invitation as used
        const { error: inviteError } = await supabaseClient
          .from(tableName)
          .update({ 
            is_used: true,
            status: 'accepted',
            accepted_at: new Date().toISOString(),
            accepted_by_user_id: userId
          })
          .eq('link_token', token)
          .eq('email', email);

        if (inviteError) {
          console.error('Error updating invitation:', inviteError);
          throw inviteError;
        }

        // 3. Check if the property link already exists
        const linkQuery = {
          property_id: propertyId,
        };
        
        if (role === 'tenant') {
          linkQuery.tenant_id = userId;
        } else {
          linkQuery.service_provider_id = userId;
        }
        
        // First check if link already exists
        const { data: existingLink, error: existingLinkError } = await supabaseClient
          .from(linkTableName)
          .select('id')
          .eq('property_id', propertyId)
          .eq(role === 'tenant' ? 'tenant_id' : 'service_provider_id', userId)
          .maybeSingle();
          
        if (existingLinkError) {
          console.error('Error checking existing property link:', existingLinkError);
          throw existingLinkError;
        }
        
        // Only create the link if it doesn't already exist
        if (!existingLink) {
          const linkData = {
            property_id: propertyId,
          };
          
          if (role === 'tenant') {
            linkData.tenant_id = userId;
          } else {
            linkData.service_provider_id = userId;
          }

          const { error: linkError } = await supabaseClient
            .from(linkTableName)
            .insert(linkData);

          if (linkError) {
            console.error('Error creating property link:', linkError);
            throw linkError;
          }
          
          console.log('User successfully linked to property');
        } else {
          console.log('User was already linked to this property');
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            userExists: existingUser && existingUser.user ? true : false,
            userLinked: true
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      } catch (error: any) {
        console.error('Transaction error:', error);
        
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
    
    // New action to link an existing user to a property from an invitation token
    if (action === 'linkExistingUser') {
      const { token, email, propertyId, role, userId } = requestData;
      
      if (!token || !email || !propertyId || !role || !userId) {
        const missingParams = [];
        if (!token) missingParams.push('token');
        if (!email) missingParams.push('email');
        if (!propertyId) missingParams.push('propertyId');
        if (!role) missingParams.push('role');
        if (!userId) missingParams.push('userId');
        
        console.error("Missing parameters:", missingParams);
        throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
      }
      
      console.log(`Linking existing user ${userId} to property ${propertyId} as ${role}`);
      
      // Begin transaction
      const tableName = role === 'tenant' ? 'tenant_invitations' : 'service_provider_invitations';
      const linkTableName = role === 'tenant' ? 'tenant_property_link' : 'service_provider_property_link';
      
      try {
        // 1. Mark invitation as used
        const { error: inviteError } = await supabaseClient
          .from(tableName)
          .update({ 
            is_used: true,
            status: 'accepted',
            accepted_at: new Date().toISOString(),
            accepted_by_user_id: userId
          })
          .eq('link_token', token)
          .eq('email', email);

        if (inviteError) {
          console.error('Error updating invitation:', inviteError);
          throw inviteError;
        }
        
        // 2. Create property link if it doesn't exist
        const linkData = {
          property_id: propertyId,
        };
        
        if (role === 'tenant') {
          linkData.tenant_id = userId;
        } else {
          linkData.service_provider_id = userId;
        }
        
        // First check if link already exists
        const { data: existingLink, error: existingLinkError } = await supabaseClient
          .from(linkTableName)
          .select('id')
          .eq('property_id', propertyId)
          .eq(role === 'tenant' ? 'tenant_id' : 'service_provider_id', userId)
          .maybeSingle();
          
        if (existingLinkError) {
          console.error('Error checking existing property link:', existingLinkError);
          throw existingLinkError;
        }
        
        // Only create the link if it doesn't already exist
        if (!existingLink) {
          const { error: linkError } = await supabaseClient
            .from(linkTableName)
            .insert(linkData);

          if (linkError) {
            console.error('Error creating property link:', linkError);
            throw linkError;
          }
        } else {
          console.log('User was already linked to this property');
        }

        return new Response(
          JSON.stringify({ success: true }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      } catch (error: any) {
        console.error('Error linking existing user:', error);
        return new Response(
          JSON.stringify({ 
            error: error.message || "Error linking user to property",
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
