
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, CheckCircle } from "lucide-react";
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
      console.log("Starting password reset process for:", email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        console.error("Reset password error:", error);
        
        if (error.message.includes("User not found") || error.message.includes("user_not_found")) {
          throw new Error("No account found with this email address");
        } else if (error.message.includes("Email rate limit") || error.message.includes("rate_limit")) {
          throw new Error("Too many reset attempts. Please wait before trying again");
        } else if (error.message.includes("Invalid email") || error.message.includes("invalid_email")) {
          throw new Error("Please enter a valid email address");
        }
        
        throw new Error(error.message || "Failed to send reset email");
      }

      console.log("Password reset email sent successfully");
      setResetEmailSent(true);
      toast.success("Password reset instructions sent!", {
        description: "Check your email for the reset link"
      });
    } catch (error) {
      console.error("Reset password error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send reset email";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  if (resetEmailSent) {
    return (
      <motion.div 
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <h3 className="text-lg font-medium">Check your email</h3>
        <p className="text-sm text-gray-600">
          We've sent password reset instructions to <strong>{email}</strong>
        </p>
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-700">
            Click the link in your email to reset your password. If you don't receive it within a few minutes, check your spam folder.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            onModeChange("login");
            setResetEmailSent(false);
            setError(null);
            setEmail("");
          }}
        >
          Back to Sign In
        </Button>
      </motion.div>
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
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              required
              placeholder="Enter your email address"
              className="pl-10"
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading || !email.trim()}>
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
