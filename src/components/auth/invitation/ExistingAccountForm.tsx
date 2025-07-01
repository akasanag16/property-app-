
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft } from "lucide-react";
import { UserRole } from "@/lib/auth";
import { EnhancedErrorAlert } from "./components/EnhancedErrorAlert";
import { useEnhancedFormSubmission } from "./hooks/useEnhancedFormSubmission";

interface ExistingAccountFormProps {
  email: string;
  token: string;
  propertyId: string;
  role: UserRole;
  onToggleMode: () => void; // Keep for backward compatibility but not used
  onBackToLogin: () => void;
  setError: (error: string) => void;
  error: string;
}

export function ExistingAccountForm({
  email,
  token,
  propertyId,
  role,
  onBackToLogin,
  setError: setGlobalError,
  error: globalError
}: ExistingAccountFormProps) {
  const navigate = useNavigate();
  const [existingPassword, setExistingPassword] = useState("");

  const { 
    loading, 
    error, 
    clearError, 
    retry, 
    linkExistingUser 
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
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!existingPassword || existingPassword.length < 6) {
      setGlobalError("Please enter your password (minimum 6 characters)");
      return;
    }
    
    try {
      // First sign out any current user
      await supabase.auth.signOut();
      
      // Wait a moment for sign out to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Attempt to sign in with the provided credentials
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: existingPassword
      });
      
      if (signInError) {
        throw signInError;
      }
      
      if (!signInData?.user) {
        throw new Error("Failed to authenticate. Please try again.");
      }
      
      // Verify the signed-in user's email matches the invitation email
      if (signInData.user.email?.toLowerCase().trim() !== email.toLowerCase().trim()) {
        await supabase.auth.signOut();
        throw new Error("This account email does not match the invitation email. Please use the correct account.");
      }
      
      // Now link the user to the property
      await linkExistingUser({
        token,
        email,
        propertyId,
        role,
        userId: signInData.user.id
      });
      
    } catch (error: any) {
      console.error("Error linking existing account:", error);
      
      // Provide more specific error messages
      if (error.message?.includes('Invalid login credentials')) {
        setGlobalError("Invalid email or password. Please check your credentials and try again.");
      } else if (error.message?.includes('Email not confirmed')) {
        setGlobalError("Please check your email and confirm your account before signing in.");
      } else if (error.message?.includes('Too many requests')) {
        setGlobalError("Too many login attempts. Please wait a moment and try again.");
      } else {
        setGlobalError(error.message || "Failed to link account. Please check your credentials and try again.");
      }
    }
  };

  const clearAllErrors = () => {
    clearError();
    if (globalError) setGlobalError("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} readOnly className="bg-gray-100" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="existingPassword">Password</Label>
        <Input
          id="existingPassword"
          type="password"
          value={existingPassword}
          onChange={(e) => {
            setExistingPassword(e.target.value);
            clearAllErrors();
          }}
          placeholder="Enter your password"
          required
          autoComplete="current-password"
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Linking to property...
          </>
        ) : (
          "Connect to Property"
        )}
      </Button>
      
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
