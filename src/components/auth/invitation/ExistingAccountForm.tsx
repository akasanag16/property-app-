
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { UserRole } from "@/lib/auth";

interface ExistingAccountFormProps {
  email: string;
  token: string;
  propertyId: string;
  role: UserRole;
  onToggleMode: () => void;
  onBackToLogin: () => void;
  setError: (error: string) => void;
  error: string;
}

export function ExistingAccountForm({
  email,
  token,
  propertyId,
  role,
  onToggleMode,
  onBackToLogin,
  setError,
  error
}: ExistingAccountFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [existingPassword, setExistingPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!existingPassword || existingPassword.length < 6) {
      setError("Please enter your password (minimum 6 characters)");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      console.log("Trying to link existing account with email:", email);
      
      // First, sign out any current user to ensure we're starting fresh
      await supabase.auth.signOut();
      
      // Attempt to sign in with the provided credentials
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: existingPassword
      });
      
      if (signInError) {
        console.error("Sign in error:", signInError);
        throw new Error("Invalid login credentials. Please check your password and try again.");
      }
      
      if (!signInData?.user) {
        throw new Error("Failed to authenticate. Please try again.");
      }
      
      console.log("User authenticated successfully:", signInData.user.id);
      
      // Now link the user to the property
      const { data, error: functionError } = await supabase.functions.invoke('handle-invitation', {
        body: {
          action: "linkExistingUser",
          token,
          email,
          propertyId,
          role,
          userId: signInData.user.id
        }
      });
      
      if (functionError || !data?.success) {
        console.error("Function error:", functionError || data?.error);
        throw new Error(data?.error || functionError?.message || "Error linking to property. Please try again.");
      }
      
      // Show success message
      toast.success("Successfully linked to property!");
      
      // Navigate to the appropriate dashboard based on role
      setTimeout(() => {
        if (role === 'tenant') {
          navigate("/tenant-dashboard");
        } else if (role === 'service_provider') {
          navigate("/service-provider-dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 1000);
      
    } catch (error: any) {
      console.error("Error linking existing account:", error);
      setError(error.message || "Failed to link account. Please check your password and try again.");
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
          onChange={(e) => setExistingPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Linking property...
          </>
        ) : (
          "Link to Property"
        )}
      </Button>
      <div className="text-center text-sm">
        <button 
          type="button" 
          className="text-primary hover:underline"
          onClick={onToggleMode}
        >
          Create new account instead
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
