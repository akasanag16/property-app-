import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { UserRole } from "@/lib/auth";

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [invitationData, setInvitationData] = useState<{
    token: string;
    email: string;
    propertyId: string;
    role: UserRole;
  } | null>(null);

  // Validate token on load
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

        // Use the edge function to validate the token
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

        // Set email from URL
        setEmail(email);
        
        // Store invitation data
        setInvitationData({
          token,
          email,
          propertyId: data.propertyId,
          role: data.role as UserRole
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitationData) {
      setError("Invalid invitation data");
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
      // Use the edge function to create the user and accept the invitation
      const { data, error: functionError } = await supabase.functions.invoke('handle-invitation', {
        body: {
          action: "createInvitedUser",
          token: invitationData.token,
          email: invitationData.email,
          propertyId: invitationData.propertyId,
          role: invitationData.role,
          firstName,
          lastName,
          password
        }
      });
      
      if (functionError) throw new Error(functionError.message);
      
      toast.success("Account created successfully! Please sign in to continue.");
      setTimeout(() => navigate("/auth"), 2000);
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      setError(error.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Validating Invitation</CardTitle>
            <CardDescription>Please wait while we validate your invitation</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Invalid Invitation</CardTitle>
            <CardDescription>There was a problem with your invitation link</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate("/auth")}>
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Accept Invitation</CardTitle>
          <CardDescription>
            Create your account to access the property management portal
            {invitationData?.role && (
              <span className="block mt-1 font-medium">
                You'll be joining as a {invitationData.role.replace('_', ' ')}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
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
          </form>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => navigate("/auth")}>
            I already have an account
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
