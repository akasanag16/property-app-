
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://smooniqpqenxdbkceppn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtb29uaXFwcWVueGRia2NlcHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNjI0ODUsImV4cCI6MjA2MDgzODQ4NX0.MhwwE_baKbSuSM8yHUxgREWGwOxEHhW05RygLy3xHBw";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: false
  }
});
