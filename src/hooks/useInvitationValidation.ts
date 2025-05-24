
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/lib/auth";

interface InvitationData {
  token: string;
  email: string;
  propertyId: string;
  role: UserRole;
  invitationType?: string;
  invitationId?: string;
}

export function useInvitationValidation() {
  const [searchParams] = useSearchParams();
  const [validating, setValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState("");
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const token = searchParams.get("token");
        const email = searchParams.get("email");
        
        if (!token || !email) {
          setError("Invalid invitation link. Missing token or email.");
          setValidating(false);
          return;
        }

        // Normalize email for consistency
        const normalizedEmail = email.toLowerCase().trim();

        // Validate email format
        const emailPattern = /\S+@\S+\.\S+/;
        if (!emailPattern.test(normalizedEmail)) {
          setError("Invalid email format in invitation link.");
          setValidating(false);
          return;
        }

        console.log(`Validating invitation: token=${token}, email=${normalizedEmail}`);

        // Check if we're already authenticated
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          // If we're already logged in with a different email, we need to sign out first
          const currentUserEmail = session.user.email?.toLowerCase().trim();
          
          if (currentUserEmail && currentUserEmail !== normalizedEmail) {
            console.log("Signed in with different email. Signing out first...");
            await supabase.auth.signOut();
            // Small delay to ensure sign out is complete
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        // Now validate the token
        const { data, error: functionError } = await supabase.functions.invoke('handle-invitation', {
          body: { 
            action: "validateToken",
            token,
            email: normalizedEmail
          }
        });

        if (functionError) {
          console.error("Invitation function error:", functionError);
          setError("Error validating invitation. Please try again or contact support.");
          setValidating(false);
          return;
        }

        console.log("Validation response:", data);

        if (!data || !data.valid) {
          console.error("Invitation validation failed:", data?.message || "Invalid token");
          setError(data?.message || "This invitation is invalid or has expired. Please request a new invitation.");
          setValidating(false);
          return;
        }

        setInvitationData({
          token,
          email: normalizedEmail, // Use the normalized email consistently
          propertyId: data.propertyId,
          role: data.role as UserRole,
          invitationType: data.invitationType,
          invitationId: data.invitationId
        });
        
        setIsValid(true);
        setValidating(false);
      } catch (error) {
        console.error("Error validating invitation:", error);
        setError("Error validating invitation. Please check your internet connection and try again.");
        setValidating(false);
      }
    };

    validateToken();
  }, [searchParams]);

  return { validating, isValid, error, invitationData };
}
