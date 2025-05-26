
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, Info } from "lucide-react";
import { UserRole } from "@/lib/auth";
import { PasswordInputs } from "./components/PasswordInputs";
import { EnhancedNameInputs } from "./components/EnhancedNameInputs";
import { EnhancedErrorAlert } from "./components/EnhancedErrorAlert";
import { useEnhancedFormSubmission } from "./hooks/useEnhancedFormSubmission";
import { supabase } from "@/integrations/supabase/client";

interface NewAccountFormProps {
  email: string;
  token: string;
  propertyId: string;
  role: UserRole;
  onToggleMode: () => void;
  onBackToLogin: () => void;
  setError: (error: string) => void;
  error: string;
}

export function NewAccountForm({
  email,
  token,
  propertyId,
  role,
  onToggleMode,
  onBackToLogin,
  setError: setGlobalError,
  error: globalError
}: NewAccountFormProps) {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { 
    loading, 
    error, 
    clearError, 
    retry, 
    createInvitedUser 
  } = useEnhancedFormSubmission({
    onSuccess: () => {
      // Navigate to appropriate dashboard
      setTimeout(() => {
        if (role === 'tenant') {
          navigate("/tenant-dashboard");
        } else if (role === 'service_provider') {
          navigate("/service-provider-dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 1000);
    },
    onToggleMode
  });

  const validateForm = () => {
    const errors = [];
    
    if (!firstName.trim()) errors.push("First name is required");
    if (!lastName.trim()) errors.push("Last name is required");
    if (firstName.includes('@') || lastName.includes('@')) {
      errors.push("Names cannot contain email addresses");
    }
    if (password !== confirmPassword) errors.push("Passwords do not match");
    if (password.length < 6) errors.push("Password must be at least 6 characters");
    
    return errors;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setGlobalError(validationErrors[0]);
      return;
    }
    
    await createInvitedUser({
      token,
      email,
      propertyId,
      role,
      firstName,
      lastName,
      password
    });
  };

  const clearAllErrors = () => {
    clearError();
    if (globalError) setGlobalError("");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Helpful instructions */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Please enter your actual first and last name. Do not use email addresses in the name fields.
        </AlertDescription>
      </Alert>

      {/* Enhanced error display */}
      {error && (
        <EnhancedErrorAlert 
          error={error} 
          onRetry={retry}
          onClear={clearError}
        />
      )}
      
      {/* Legacy error for backward compatibility */}
      {globalError && !error && (
        <Alert variant="destructive">
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}
      
      <EnhancedNameInputs
        firstName={firstName}
        lastName={lastName}
        onFirstNameChange={setFirstName}
        onLastNameChange={setLastName}
        onErrorClear={clearAllErrors}
      />
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} readOnly className="bg-gray-100" />
      </div>
      
      <PasswordInputs
        password={password}
        confirmPassword={confirmPassword}
        onPasswordChange={setPassword}
        onConfirmPasswordChange={setConfirmPassword}
        onErrorClear={clearAllErrors}
      />
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
      
      <div className="text-center text-sm">
        <button 
          type="button" 
          className="text-primary hover:underline"
          onClick={onToggleMode}
          disabled={loading}
        >
          I already have an account
        </button>
      </div>
      
      <Button 
        type="button" 
        variant="outline" 
        className="w-full flex items-center justify-center" 
        onClick={onBackToLogin}
        disabled={loading}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Login
      </Button>
    </form>
  );
}
