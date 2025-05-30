
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuthSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Auth session hook initializing...");

    let mounted = true;

    // Set up auth state listener first to prevent missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession ? "New session exists" : "No new session");
        
        if (!mounted) return;

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(newSession);
          setUser(newSession?.user ?? null);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          // Clear any stored user data
          try {
            sessionStorage.removeItem('userRole');
          } catch (e) {
            console.warn("Failed to clear session storage:", e);
          }
        } else if (event === 'USER_UPDATED') {
          setUser(newSession?.user ?? null);
        }
        
        // Handle auth errors
        if (event === 'SIGNED_OUT' && newSession === null) {
          console.log("User signed out or session expired");
        }
      }
    );

    // Then get initial session
    const initSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error("Error getting initial session:", error);
          toast.error("Authentication error. Please try signing in again.");
          setLoading(false);
          return;
        }
        
        if (currentSession) {
          console.log("Initial session found:", currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
        } else {
          console.log("No initial session found");
          setSession(null);
          setUser(null);
        }
      } catch (err) {
        console.error("Unexpected error during session initialization:", err);
        if (mounted) {
          toast.error("Failed to initialize authentication. Please refresh the page.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initialize session
    initSession();
    
    // Cleanup subscription on unmount
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log("Signing out user...");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        toast.error("Failed to sign out. Please try again.");
        throw error;
      }
      
      console.log("User signed out successfully");
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const refreshSession = async () => {
    try {
      console.log("Refreshing session...");
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("Error refreshing session:", error);
        toast.error("Session refresh failed. Please sign in again.");
        throw error;
      }
      
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        console.log("Session refreshed successfully");
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
      throw error;
    }
  };

  return {
    user,
    session,
    loading,
    signOut,
    refreshSession
  };
};
