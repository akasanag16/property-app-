import { useState } from "react";
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
import { signUp, type UserRole } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export function SignupForm({
  onModeChange,
}: {
  onModeChange: (mode: "login") => void;
}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<UserRole>("owner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!firstName.trim() || !lastName.trim()) {
        throw new Error("Please provide both first and last name");
      }
      
      await signUp({ email, password, role, firstName, lastName });
      
      toast.success("Account created! Please check your email to verify your account.");
      onModeChange("login");
    } catch (error) {
      console.error("Auth error:", error);
      setError(error instanceof Error ? error.message : "Registration failed");
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
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
        onSubmit={handleSubmit} 
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

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
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
            autoComplete="new-password"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] hover:from-[#7E5BD5] hover:to-[#C739D6] text-white" 
          disabled={loading}
        >
          {loading ? (
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
    </>
  );
}
