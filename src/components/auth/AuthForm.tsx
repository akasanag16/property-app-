
import { useState } from "react";
import { LoginForm } from "./forms/LoginForm";
import { SignupForm } from "./forms/SignupForm";
import { ResetPasswordForm } from "./forms/ResetPasswordForm";
import { motion } from "framer-motion";

type AuthMode = "login" | "signup" | "reset";

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <motion.div 
      className="w-full bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {mode === "login" && (
        <LoginForm onModeChange={setMode} />
      )}
      {mode === "signup" && (
        <SignupForm onModeChange={setMode} />
      )}
      {mode === "reset" && (
        <ResetPasswordForm onModeChange={setMode} />
      )}
    </motion.div>
  );
}
