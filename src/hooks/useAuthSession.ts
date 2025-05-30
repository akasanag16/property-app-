
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuthSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false); // Changed to false initially

  useEffect(() => {
    console.log("useAuthSession: Initializing auth session hook...");

    let mounted = true;

    // Set up auth state listener first to prevent missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("useAuthSession: Auth state changed:", event, newSession ? "New session exists" : "No new session");
        
        if (!mounted) return;

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setLoading(false);
          // Clear any stored user data
          try {
            sessionStorage.removeItem('userRole');
          } catch (e) {
            console.warn("Failed to clear session storage:", e);
          }
        } else if (event === 'USER_UPDATED') {
          setUser(newSession?.user ?? null);
        }
      }
    );

    // Then get initial session - but don't block rendering
    const initSession = async () => {
      try {
        setLoading(true);
        console.log("useAuthSession: Checking for existing session...");
        
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error("useAuthSession: Error getting initial session:", error);
          // Don't show error toast for initial load, just log it
          console.warn("Authentication initialization failed, proceeding without session");
        } else if (currentSession) {
          console.log("useAuthSession: Initial session found:", currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
        } else {
          console.log("useAuthSession: No initial session found");
          setSession(null);
          setUser(null);
        }
      } catch (err) {
        console.error("useAuthSession: Unexpected error during session initialization:", err);
        // Don't block the app for auth errors
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
      console.log("useAuthSession: Signing out user...");
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("useAuthSession: Error signing out:", error);
        toast.error("Failed to sign out. Please try again.");
        throw error;
      }
      
      console.log("useAuthSession: User signed out successfully");
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("useAuthSession: Error signing out:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      console.log("useAuthSession: Refreshing session...");
      setLoading(true);
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("useAuthSession: Error refreshing session:", error);
        toast.error("Session refresh failed. Please sign in again.");
        throw error;
      }
      
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        console.log("useAuthSession: Session refreshed successfully");
      }
    } catch (error) {
      console.error("useAuthSession: Error refreshing session:", error);
      throw error;
    } finally {
      setLoading(false);
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
