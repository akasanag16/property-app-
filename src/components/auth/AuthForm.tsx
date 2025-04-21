
import { useState } from "react";
import { LoginForm } from "./forms/LoginForm";
import { SignupForm } from "./forms/SignupForm";
import { ResetPasswordForm } from "./forms/ResetPasswordForm";

type AuthMode = "login" | "signup" | "reset";

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <div className="w-full space-y-8 p-8 bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
      {mode === "login" && (
        <LoginForm onModeChange={setMode} />
      )}
      {mode === "signup" && (
        <SignupForm onModeChange={setMode} />
      )}
      {mode === "reset" && (
        <ResetPasswordForm onModeChange={setMode} />
      )}
    </div>
  );
}
