
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuthSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first to prevent missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(newSession);
          setUser(newSession?.user ?? null);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
        } else if (event === 'USER_UPDATED') {
          // Handle user metadata updates
          setUser(newSession?.user ?? null);
        }
      }
    );

    // Then get initial session
    const initSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          // Only log in development
          if (process.env.NODE_ENV === 'development') {
            console.error("Error getting initial session:", error);
          }
          setLoading(false);
          return;
        }
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
        } else {
          setSession(null);
          setUser(null);
        }
      } catch (err) {
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.error("Unexpected error during session initialization:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    // Initialize session
    initSession();
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error signing out:", error);
      }
      throw error;
    }
  };

  return {
    user,
    session,
    loading,
    signOut
  };
};
