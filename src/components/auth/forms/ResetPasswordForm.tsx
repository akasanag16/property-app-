
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

export function ResetPasswordForm({
  onModeChange,
}: {
  onModeChange: (mode: "login") => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get the origin from window.location
      const origin = window.location.origin;
      
      // Construct the absolute redirect URL
      const resetRedirectUrl = `${origin}/auth/reset-password`;
      
      console.log("Using reset redirect URL:", resetRedirectUrl);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetRedirectUrl,
      });

      if (error) throw error;

      setResetEmailSent(true);
      toast.success("Password reset instructions have been sent to your email");
    } catch (error) {
      console.error("Reset password error:", error);
      setError(error instanceof Error ? error.message : "Failed to send reset email");
      toast.error(error instanceof Error ? error.message : "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  }

  if (resetEmailSent) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-lg font-medium">Check your email</h3>
        <p className="text-sm text-gray-600">
          We've sent password reset instructions to {email}
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            onModeChange("login");
            setResetEmailSent(false);
          }}
        >
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="text-center">
        <h2 className="text-2xl font-bold">Reset Password</h2>
        <p className="text-sm text-gray-600 mt-1">
          Enter your email to receive reset instructions
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Reset Link...
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </motion.form>

      <div className="text-center text-sm">
        <p>
          Remember your password?{" "}
          <button
            onClick={() => onModeChange("login")}
            className="text-primary hover:underline font-medium"
            type="button"
          >
            Sign in
          </button>
        </p>
      </div>
    </>
  );
}
