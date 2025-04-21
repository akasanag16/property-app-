
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserRole } from "@/lib/auth";

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const type = searchParams.get("type") as "tenant" | "service_provider";
  const navigate = useNavigate();

  const [invitationData, setInvitationData] = useState<{
    email: string;
    propertyId: string;
    propertyName: string;
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Validate invitation token
  useEffect(() => {
    const validateInvitation = async () => {
      if (!token || !type) {
        toast.error("Invalid invitation link");
        navigate("/auth");
        return;
      }

      try {
        // Determine which table to use based on the type
        const tableName = type === "tenant" ? "tenant_invitations" : "service_provider_invitations";
        
        // Get the invitation
        const { data: invitation, error: invitationError } = await supabase
          .from(tableName)
          .select("*")
          .eq("link_token", token)
          .single();

        if (invitationError || !invitation) {
          throw new Error("Invitation not found or expired");
        }

        // Check if the invitation is used
        if (invitation.is_used) {
          throw new Error("This invitation has already been used");
        }

        // Check if the invitation is expired
        if (new Date(invitation.expires_at) < new Date()) {
          throw new Error("This invitation has expired");
        }

        // Get property info
        const { data: property, error: propertyError } = await supabase
          .from("properties")
          .select("name")
          .eq("id", invitation.property_id)
          .single();

        if (propertyError || !property) {
          throw new Error("Property not found");
        }

        setInvitationData({
          email: invitation.email,
          propertyId: invitation.property_id,
          propertyName: property.name,
        });
        
      } catch (error) {
        console.error("Error validating invitation:", error);
        toast.error(error instanceof Error ? error.message : "Invalid invitation");
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    validateInvitation();
  }, [token, type, navigate]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterForm({
      ...registerForm,
      [e.target.id]: e.target.value,
    });
  };

  // Register user and accept invitation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitationData) return;
    
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      // Determine the role based on invitation type
      const role: UserRole = type === "tenant" ? "tenant" : "service_provider";
      
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitationData.email,
        password: registerForm.password,
        options: {
          data: {
            role,
            first_name: registerForm.firstName,
            last_name: registerForm.lastName,
          },
        },
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      // Mark invitation as used
      const tableName = type === "tenant" ? "tenant_invitations" : "service_provider_invitations";
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ is_used: true })
        .eq("link_token", token);
        
      if (updateError) throw updateError;

      // Create property link
      const linkTable = type === "tenant" ? "tenant_property_link" : "service_provider_property_link";
      const linkColumn = type === "tenant" ? "tenant_id" : "service_provider_id";
      
      const linkData = {
        property_id: invitationData.propertyId,
        [linkColumn]: authData.user.id,
      };

      const { error: linkError } = await supabase
        .from(linkTable)
        .insert(linkData);
        
      if (linkError) throw linkError;

      toast.success("Registration successful! You can now log in.");
      navigate("/auth");
      
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-2">Accept Invitation</h1>
        {invitationData && (
          <>
            <p className="text-center text-gray-600 mb-6">
              You've been invited to join the property "{invitationData.propertyName}" as a {type === "tenant" ? "tenant" : "service provider"}.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={invitationData.email}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={registerForm.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  required
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={registerForm.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  required
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={registerForm.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  minLength={6}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  minLength={6}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating Account..." : "Create Account & Accept Invitation"}
              </Button>
              
              <div className="text-center mt-4">
                <Button
                  variant="link"
                  onClick={() => navigate("/auth")}
                  className="text-sm"
                >
                  Return to login
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
