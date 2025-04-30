
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

interface InvitationAcceptanceFormProps {
  email: string;
  token: string;
  propertyId: string;
  role: UserRole;
}

export function InvitationAcceptanceForm({ email, token, propertyId, role }: InvitationAcceptanceFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
      console.log("Submitting invitation acceptance for:", email);
      console.log("With token:", token);
      console.log("For property:", propertyId);
      console.log("As role:", role);
      
      // Check if user already exists with this email
      const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
        email,
        password: "temporary-check-only"
      });
      
      if (!checkError || (checkError && checkError.message?.includes("Invalid login credentials"))) {
        // If the user already exists (either successful login or invalid password error)
        // We'll handle this gracefully - direct them to login
        toast.info("An account with this email already exists. Please sign in instead.");
        setTimeout(() => navigate("/auth"), 2000);
        return;
      }
      
      const { data, error: functionError } = await supabase.functions.invoke('handle-invitation', {
        body: {
          action: "createInvitedUser",
          token,
          email,
          propertyId,
          role,
          firstName,
          lastName,
          password
        }
      });
      
      if (functionError) {
        console.error("Function error:", functionError);
        throw new Error(functionError.message || "Error accepting invitation");
      }
      
      if (!data?.success) {
        console.error("Operation failed:", data);
        // Check if this is a known error about email already existing
        if (data?.error && data.error.includes("already been registered")) {
          toast.info("An account with this email already exists. Please sign in instead.");
          setTimeout(() => navigate("/auth"), 2000);
          return;
        }
        
        throw new Error(data?.error || "Failed to create account. Please try again.");
      }
      
      toast.success("Account created successfully! Please sign in to continue.");
      setTimeout(() => navigate("/auth"), 2000);
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      
      // Handle specific error cases
      if (error.message?.includes("already been registered") || 
          error.message?.includes("email_exists")) {
        toast.info("An account with this email already exists. Please sign in instead.");
        setTimeout(() => navigate("/auth"), 2000);
        return;
      }
      
      setError(error.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/auth");
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
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
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
      <Button 
        type="button" 
        variant="outline" 
        className="w-full flex items-center justify-center" 
        onClick={handleBackToLogin}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Login
      </Button>
    </form>
  );
}
