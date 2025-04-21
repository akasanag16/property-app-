
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
import { signIn, signUp, type UserRole } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type AuthMode = "login" | "signup";

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<UserRole>("owner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        if (!firstName.trim() || !lastName.trim()) {
          throw new Error("Please provide both first and last name");
        }
        
        await signUp({ email, password, role, firstName, lastName });
        toast.success(
          "Account created! Please sign in with your new credentials."
        );
        // Switch to login mode after signup
        setMode("login");
      } else {
        const { session } = await signIn({ email, password });
        if (session) {
          toast.success("Signed in successfully");
          navigate("/dashboard");
        } else {
          // This should rarely happen, but just in case
          setError("Login successful but no session was created. Please try again.");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      setError(error instanceof Error ? error.message : "Authentication failed");
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <h2 className="text-2xl font-bold">{mode === "login" ? "Sign In" : "Create Account"}</h2>
        <p className="text-sm text-gray-600 mt-1">
          {mode === "login" ? "Welcome back" : "Join our platform"}
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
        {mode === "signup" && (
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
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete={mode === "login" ? "username" : "email"}
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
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === "login" ? "Signing In..." : "Creating Account..."}
            </>
          ) : (
            mode === "login" ? "Sign In" : "Create Account"
          )}
        </Button>
      </motion.form>

      <div className="text-center text-sm">
        {mode === "login" ? (
          <p>
            Don't have an account?{" "}
            <button
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className="text-primary hover:underline font-medium"
              type="button"
            >
              Sign up
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <button
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className="text-primary hover:underline font-medium"
              type="button"
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
