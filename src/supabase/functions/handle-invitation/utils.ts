
// For browser/Node environment, use a regular import
import { createClient } from '@supabase/supabase-js';

// Shared CORS headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create and return a Supabase client
export function getSupabaseClient() {
  // Check if we're in a Deno environment (Edge Function)
  if (typeof globalThis.Deno !== 'undefined') {
    // In Deno environment, use dynamic import
    return createClient(
      globalThis.Deno.env.get('SUPABASE_URL') ?? '',
      globalThis.Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
  }
  
  // In browser/Node environment, use environment variables
  return createClient(
    process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  );
}

// Helper function to format responses
export function createSuccessResponse(data: any) {
  return new Response(
    JSON.stringify(data),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}

export function createErrorResponse(error: Error | string, status = 400) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorDetails = typeof error === 'string' ? "" : error.stack;

  return new Response(
    JSON.stringify({ 
      error: errorMessage || "Unknown error occurred",
      details: errorDetails || ""
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status,
    }
  )
}

// Helper function to check if email column exists in profiles
export async function checkEmailColumnExists(supabase: any) {
  try {
    const { data, error } = await supabase.rpc('list_public_tables');
    
    if (error) {
      console.error('Error checking tables:', error);
      return false;
    }
    
    // Get table structure
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'profiles');
      
    if (columnsError) {
      console.error('Error checking columns:', columnsError);
      return false;
    }
    
    if (columns) {
      const hasEmailColumn = columns.some(col => col.column_name === 'email');
      return hasEmailColumn;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking email column:', error);
    return false;
  }
}
