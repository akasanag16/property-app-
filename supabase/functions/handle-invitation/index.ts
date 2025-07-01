
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { validateToken } from "./validate-token.ts";
import { linkExistingUser } from "./link-existing-user.ts";
import { corsHeaders } from "./utils.ts";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    const requestData = await req.json()
    const { action } = requestData
    
    if (!action) {
      throw new Error("Missing required action parameter")
    }
    
    console.log(`Processing invitation request: ${action}`)

    // Handle token validation
    if (action === 'validateToken') {
      return await validateToken(requestData);
    }
    
    // Handle linking an existing user to a property from an invitation token
    if (action === 'linkExistingUser') {
      return await linkExistingUser(requestData);
    }

    throw new Error('Invalid action: ' + action + '. Available actions: validateToken, linkExistingUser');
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
