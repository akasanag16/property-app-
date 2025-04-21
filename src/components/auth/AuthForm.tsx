
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { signIn, signUp, type UserRole } from "@/lib/auth";

type AuthMode = "login" | "signup";

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<UserRole>("owner");
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        await signUp({ email, password, role, firstName, lastName });
        toast({
          title: "Account created",
          description: "Please check your email to verify your account.",
        });
      } else {
        await signIn({ email, password });
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <h2 className="text-2xl font-bold">{mode === "login" ? "Sign In" : "Create Account"}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {mode === "signup" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
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
          </>
        )}

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

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Loading..." : mode === "login" ? "Sign In" : "Create Account"}
        </Button>
      </form>

      <div className="text-center text-sm">
        {mode === "login" ? (
          <p>
            Don't have an account?{" "}
            <button
              onClick={() => setMode("signup")}
              className="text-blue-600 hover:underline"
            >
              Sign up
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <button
              onClick={() => setMode("login")}
              className="text-blue-600 hover:underline"
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
