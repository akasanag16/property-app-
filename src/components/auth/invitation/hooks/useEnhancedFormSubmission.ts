
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ApiError, parseApiError } from "../utils/errorHandling";

interface UseEnhancedFormSubmissionProps {
  onSuccess: () => void;
  onToggleMode?: () => void;
}

export function useEnhancedFormSubmission({ onSuccess, onToggleMode }: UseEnhancedFormSubmissionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const clearError = () => setError(null);

  const submitWithRetry = async (submitFn: () => Promise<void>, maxRetries = 3) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Submission attempt ${retryCount + 1}/${maxRetries + 1}`);
      
      await submitFn();
      
      // Reset retry count on success
      setRetryCount(0);
      toast.success("Success!");
      onSuccess();
      
    } catch (error: any) {
      console.error("Submission error:", error);
      
      const parsedError = parseApiError(error);
      setError(parsedError);
      
      // Show toast for user feedback
      toast.error(parsedError.message);
      
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setError(null);
    }
  };

  const createInvitedUser = async (data: {
    token: string;
    email: string;
    propertyId: string;
    role: string;
    firstName: string;
    lastName: string;
    password: string;
  }) => {
    await submitWithRetry(async () => {
      console.log("Creating invited user:", { 
        email: data.email, 
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName 
      });
      
      const { data: result, error: functionError } = await supabase.functions.invoke('handle-invitation', {
        body: {
          action: "createInvitedUser",
          token: data.token,
          email: data.email.toLowerCase().trim(),
          propertyId: data.propertyId,
          role: data.role,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          password: data.password
        }
      });
      
      if (functionError) {
        throw functionError;
      }
      
      // Handle the new response format
      if (result?.userExists && result?.requiresLinking) {
        console.log("User exists, should switch to linking flow");
        toast.info("An account with this email already exists. Switching to sign-in mode...");
        
        // Give user time to read the message, then switch modes
        if (onToggleMode) {
          setTimeout(() => {
            onToggleMode();
          }, 2000);
        }
        return;
      }
      
      if (!result?.success) {
        throw new Error(result?.message || "Failed to create account");
      }
      
      console.log("Account created successfully");
    });
  };

  const linkExistingUser = async (data: {
    token: string;
    email: string;
    propertyId: string;
    role: string;
    userId: string;
  }) => {
    await submitWithRetry(async () => {
      console.log("Linking existing user:", { email: data.email, role: data.role });
      
      const { data: result, error: functionError } = await supabase.functions.invoke('handle-invitation', {
        body: {
          action: "linkExistingUser",
          token: data.token,
          email: data.email.toLowerCase().trim(),
          propertyId: data.propertyId,
          role: data.role,
          userId: data.userId
        }
      });
      
      if (functionError) {
        throw functionError;
      }
      
      if (!result?.success) {
        throw new Error(result?.error || "Failed to link account");
      }
      
      console.log("Account linked successfully");
    });
  };

  return {
    loading,
    error,
    retryCount,
    clearError,
    retry,
    createInvitedUser,
    linkExistingUser
  };
}
