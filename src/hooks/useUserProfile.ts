import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserProfile = {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  loading: boolean;
};

export function useUserProfile(user: User | null): UserProfile {
  const [profile, setProfile] = useState<UserProfile>({
    first_name: user?.user_metadata?.first_name || null,
    last_name: user?.user_metadata?.last_name || null,
    email: user?.email || null,
    loading: true
  });

  useEffect(() => {
    const fetchProfile = async () => {
      // If we already have the names from metadata, use those
      if (user?.user_metadata?.first_name || user?.user_metadata?.last_name) {
        setProfile({
          first_name: user.user_metadata.first_name || null,
          last_name: user.user_metadata.last_name || null,
          email: user?.email || null,
          loading: false
        });
        return;
      }

      // Otherwise, fetch from profiles table
      if (!user) {
        setProfile({
          first_name: null,
          last_name: null,
          email: null,
          loading: false
        });
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          setProfile({
            first_name: null,
            last_name: null,
            email: user?.email || null,
            loading: false
          });
          return;
        }

        setProfile({
          first_name: data?.first_name || null,
          last_name: data?.last_name || null,
          email: user?.email || null,
          loading: false
        });
      } catch (error) {
        console.error('Unexpected error fetching profile:', error);
        setProfile({
          first_name: null,
          last_name: null,
          email: user?.email || null,
          loading: false
        });
      }
    };

    fetchProfile();
  }, [user]);

  return profile;
}
