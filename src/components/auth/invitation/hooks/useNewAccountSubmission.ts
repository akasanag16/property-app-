
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserRole } from "@/lib/auth";

interface UseNewAccountSubmissionProps {
  email: string;
  token: string;
  propertyId: string;
  role: UserRole;
  onToggleMode: () => void;
  setError: (error: string) => void;
}

export function useNewAccountSubmission({
  email,
  token,
  propertyId,
  role,
  onToggleMode,
  setError
}: UseNewAccountSubmissionProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    firstName: string,
    lastName: string,
    password: string
  ) => {
    setLoading(true);
    setError("");
    
    try {
      // Normalize email for consistency
      const normalizedEmail = email.toLowerCase().trim();
      
      console.log("Submitting invitation acceptance for:", normalizedEmail);
      console.log("With token:", token);
      console.log("For property:", propertyId);
      console.log("As role:", role);
      console.log("Form data:", { firstName: firstName.trim(), lastName: lastName.trim() });
      
      const { data, error: functionError } = await supabase.functions.invoke('handle-invitation', {
        body: {
          action: "createInvitedUser",
          token,
          email: normalizedEmail,
          propertyId,
          role,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          password
        }
      });
      
      console.log("Response from createInvitedUser:", data);
      
      if (functionError) {
        console.error("Function error:", functionError);
        throw new Error(functionError.message || "Error accepting invitation");
      }
      
      if (!data?.success) {
        console.error("Operation failed:", data);
        // Check if this is a known error about email already existing
        if (data?.error && (
          data.error.includes("already been registered") || 
          data.error.includes("already exists")
        )) {
          toast.info("An account with this email already exists. Please sign in instead.");
          onToggleMode();
          return;
        }
        
        throw new Error(data?.error || "Failed to create account. Please try again.");
      }
      
      toast.success("Account created successfully!");
      
      // Try to sign in with the new credentials
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });
      
      if (signInError) {
        console.error("Error signing in after account creation:", signInError);
        toast.info("Account created. Please sign in with your new credentials.");
        
        // Navigate to auth page for manual sign in
        setTimeout(() => {
          navigate("/auth");
        }, 2000);
        return;
      }
      
      console.log("Successfully signed in with new account");
      
      // Navigate to the appropriate dashboard based on role
      setTimeout(() => {
        if (role === 'tenant') {
          navigate("/tenant-dashboard");
        } else if (role === 'service_provider') {
          navigate("/service-provider-dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 2000);
      
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      
      // Handle specific error cases
      if (error.message?.includes("already been registered") || 
          error.message?.includes("email_exists") ||
          error.message?.includes("already exists")) {
        toast.info("An account with this email already exists. Please sign in with that account.");
        onToggleMode();
        return;
      }
      
      setError(error.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { loading, handleSubmit };
}
