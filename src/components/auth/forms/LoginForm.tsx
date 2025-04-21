
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

    const toastId = toast.loading("Signing in...");

    try {
      const { session } = await signIn({ email, password });
      if (session) {
        toast.success("Signed in successfully", { id: toastId });
        navigate("/dashboard");
      } else {
        setError("Login failed. Please try again.");
        toast.error("Authentication failed", { id: toastId });
      }
    } catch (error) {
      console.error("Auth error:", error);
      setError(error instanceof Error ? error.message : "Authentication failed");
      toast.error(error instanceof Error ? error.message : "Authentication failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
          Welcome Back
        </h2>
        <p className="text-sm text-gray-600 mt-2">Sign in to your account</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            className="w-full"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full"
            disabled={loading}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="text-center text-sm space-y-2">
        <p>
          Don't have an account?{" "}
          <button
            onClick={() => onModeChange("signup")}
            className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
            type="button"
            disabled={loading}
          >
            Sign up
          </button>
        </p>
        <p>
          <button
            onClick={() => onModeChange("reset")}
            className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
            type="button"
            disabled={loading}
          >
            Forgot password?
          </button>
        </p>
      </div>
    </motion.div>
  );
}
