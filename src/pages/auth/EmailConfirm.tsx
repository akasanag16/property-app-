
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";

export default function EmailConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token and type from URL
        const token = searchParams.get("token") || "";
        const type = searchParams.get("type") || "";

        if (token && type) {
          const { error, data } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: "email",
          });

          if (error) throw error;
          
          // Store email for resend functionality
          setEmail(data.user?.email || "");
          toast.success("Email verified successfully! You can now sign in.");
          setTimeout(() => navigate("/auth"), 2000);
        } else {
          throw new Error("Invalid verification link");
        }
      } catch (error) {
        console.error("Verification error:", error);
        toast.error("Failed to verify email. Please try again or request a new verification link.");
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const handleResendVerification = async () => {
    if (!email) {
      toast.error("No email address available");
      return;
    }

    try {
      setResending(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      if (error) throw error;
      toast.success("Verification email sent! Please check your inbox.");
    } catch (error) {
      console.error("Resend error:", error);
      toast.error("Failed to resend verification email. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Email Verification</h2>
          {verifying ? (
            <div className="mt-4 flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-gray-600">Verifying your email...</p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <p className="text-gray-600">
                If you haven't received the verification email, you can request a new one.
              </p>
              <Button
                onClick={handleResendVerification}
                disabled={resending}
                className="w-full"
              >
                {resending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/auth")}
                className="w-full mt-2"
              >
                Back to Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
