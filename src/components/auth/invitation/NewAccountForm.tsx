
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { UserRole } from "@/lib/auth";

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
  setError,
  error
}: NewAccountFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form inputs first
    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Normalize email for consistency
      const normalizedEmail = email.toLowerCase().trim();
      
      console.log("Submitting invitation acceptance for:", normalizedEmail);
      console.log("With token:", token);
      console.log("For property:", propertyId);
      console.log("As role:", role);
      
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
        if (data?.error && data.error.includes("already been registered")) {
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
          error.message?.includes("email_exists")) {
        toast.info("An account with this email already exists. Please sign in with that account.");
        onToggleMode();
        return;
      }
      
      setError(error.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            autoComplete="given-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            autoComplete="family-name"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} readOnly className="bg-gray-100" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          minLength={6}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          minLength={6}
        />
      </div>
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
        >
          I already have an account
        </button>
      </div>
      <Button 
        type="button" 
        variant="outline" 
        className="w-full flex items-center justify-center" 
        onClick={onBackToLogin}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Login
      </Button>
    </form>
  );
}
