
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/lib/auth";

interface UseExistingAccountSubmissionProps {
  onSuccess: () => void;
}

interface LinkExistingUserParams {
  token: string;
  email: string;
  propertyId: string;
  role: UserRole;
  userId: string;
}

export function useExistingAccountSubmission({ onSuccess }: UseExistingAccountSubmissionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const retry = () => {
    // Simple retry - just clear the error
    clearError();
  };

  const linkExistingUser = async (params: LinkExistingUserParams) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('handle-invitation', {
        body: { 
          action: "linkExistingUser",
          ...params
        }
      });

      if (error) {
        throw error;
      }

      if (!data || !data.success) {
        throw new Error(data?.message || "Failed to link account to property");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error linking existing user:", error);
      setError(error.message || "Failed to link account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    clearError,
    retry,
    linkExistingUser
  };
}
