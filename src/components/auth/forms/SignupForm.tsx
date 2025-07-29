import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { signUp, type UserRole } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSecureForm } from "@/hooks/useSecureForm";

export function SignupForm({
  onModeChange,
}: {
  onModeChange: (mode: "login") => void;
}) {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>("owner");
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const {
    getFieldProps,
    handleSubmit: handleFormSubmit,
    isSubmitting,
    hasErrors,
    isValid
  } = useSecureForm(
    {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: ""
    },
    {
      onSubmit: async (data) => {
        setError(null);
        
        try {
          if (process.env.NODE_ENV === 'development') {
            console.log("Starting signup for email:", data.email);
          }
          
          const response = await signUp({ 
            email: data.email, 
            password: data.password, 
            role, 
            firstName: data.firstName, 
            lastName: data.lastName 
          });
          
          if (process.env.NODE_ENV === 'development') {
            console.log("Signup completed, response:", response);
          }
          
          // Always set confirmation sent to true if there's no error
          setConfirmationSent(true);
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account."
          });
          
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error("Auth error:", error);
          }
          const errorMessage = error instanceof Error ? error.message : "Registration failed";
          setError(errorMessage);
          toast({
            title: "Registration failed",
            description: errorMessage,
            variant: "destructive"
          });
        }
      }
    }
  );

  const emailProps = getFieldProps("email");
  const passwordProps = getFieldProps("password");
  const confirmPasswordProps = getFieldProps("confirmPassword");
  const firstNameProps = getFieldProps("firstName");
  const lastNameProps = getFieldProps("lastName");

  if (confirmationSent) {
    return (
      <motion.div 
        className="text-center space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-xl font-medium text-gray-900">Check your email</h3>
        <p className="text-gray-600">
          We've sent a confirmation link to <strong>{emailProps.value}</strong>
        </p>
        <p className="text-gray-600 text-sm">
          Please check your inbox (and spam folder) and click the link to verify your account.
        </p>
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={() => onModeChange("login")}
        >
          Back to Login
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] to-[#D946EF]">
          Create Account
        </h2>
        <p className="text-sm text-gray-600 mt-1">Join our platform</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <motion.form 
        onSubmit={handleFormSubmit} 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                {...firstNameProps}
                required
                className={firstNameProps.hasError ? "border-red-500" : ""}
              />
              {firstNameProps.error && (
                <p className="text-sm text-red-500">{firstNameProps.error}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                {...lastNameProps}
                required
                className={lastNameProps.hasError ? "border-red-500" : ""}
              />
              {lastNameProps.error && (
                <p className="text-sm text-red-500">{lastNameProps.error}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Property Owner</SelectItem>
                <SelectItem value="tenant">Tenant</SelectItem>
                <SelectItem value="service_provider">Service Provider</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...emailProps}
            required
            autoComplete="email"
            className={emailProps.hasError ? "border-red-500" : ""}
          />
          {emailProps.error && (
            <p className="text-sm text-red-500">{emailProps.error}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            {...passwordProps}
            required
            autoComplete="new-password"
            className={passwordProps.hasError ? "border-red-500" : ""}
          />
          {passwordProps.error && (
            <p className="text-sm text-red-500">{passwordProps.error}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...confirmPasswordProps}
            required
            autoComplete="new-password"
            className={confirmPasswordProps.hasError ? "border-red-500" : ""}
          />
          {confirmPasswordProps.error && (
            <p className="text-sm text-red-500">{confirmPasswordProps.error}</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] hover:from-[#7E5BD5] hover:to-[#C739D6] text-white" 
          disabled={isSubmitting || hasErrors}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </motion.form>

      <div className="text-center text-sm">
        <p>
          Already have an account?{" "}
          <button
            onClick={() => onModeChange("login")}
            className="text-[#8B5CF6] hover:text-[#D946EF] font-medium"
            type="button"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}