
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

        const { data, error: functionError } = await supabase.functions.invoke('handle-invitation', {
          body: { 
            action: "validateToken",
            token,
            email
          }
        });

        if (functionError || !data || !data.valid) {
          console.error("Invitation validation error:", functionError || "Invalid token");
          setError("This invitation is invalid or has expired.");
          setValidating(false);
          return;
        }

        setInvitationData({
          token,
          email,
          propertyId: data.propertyId,
          role: data.role as UserRole,
          invitationType: data.invitationType
        });
        
        setIsValid(true);
        setValidating(false);
      } catch (error) {
        console.error("Error validating invitation:", error);
        setError("Error validating invitation. Please try again.");
        setValidating(false);
      }
    };

    validateToken();
  }, [searchParams]);

  return { validating, isValid, error, invitationData };
}
