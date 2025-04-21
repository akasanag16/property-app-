
import { useState } from "react";
import { LoginForm } from "./forms/LoginForm";
import { SignupForm } from "./forms/SignupForm";
import { ResetPasswordForm } from "./forms/ResetPasswordForm";

type AuthMode = "login" | "signup" | "reset";

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <div className="w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
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
