
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signIn } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function LoginForm({
  onModeChange,
}: {
  onModeChange: (mode: "signup" | "reset") => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { session } = await signIn({ email, password });
      if (session) {
        toast.success("Signed in successfully");
        navigate("/dashboard");
      } else {
        setError("Login successful but no session was created. Please try again.");
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
    <>
      <div className="text-center">
        <h2 className="text-2xl font-bold">Sign In</h2>
        <p className="text-sm text-gray-600 mt-1">Welcome back</p>
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
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
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
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </motion.form>

      <div className="text-center text-sm space-y-2">
        <p>
          Don't have an account?{" "}
          <button
            onClick={() => onModeChange("signup")}
            className="text-primary hover:underline font-medium"
            type="button"
          >
            Sign up
          </button>
        </p>
        <p>
          <button
            onClick={() => onModeChange("reset")}
            className="text-primary hover:underline font-medium"
            type="button"
          >
            Forgot password?
          </button>
        </p>
      </div>
    </>
  );
}
