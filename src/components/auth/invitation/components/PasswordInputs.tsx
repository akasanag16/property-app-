
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { validatePassword, validatePasswordConfirmation } from "../utils/formValidation";

interface PasswordInputsProps {
  password: string;
  confirmPassword: string;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (confirmPassword: string) => void;
  onErrorClear: () => void;
}

export function PasswordInputs({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  onErrorClear
}: PasswordInputsProps) {
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const handlePasswordChange = (value: string) => {
    onPasswordChange(value);
    onErrorClear();
    
    // Real-time validation
    const error = validatePassword(value);
    setPasswordError(error);
    
    // Re-validate confirm password if it has a value
    if (confirmPassword) {
      const confirmError = validatePasswordConfirmation(value, confirmPassword);
      setConfirmPasswordError(confirmError);
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    onConfirmPasswordChange(value);
    onErrorClear();
    
    // Real-time validation
    const error = validatePasswordConfirmation(password, value);
    setConfirmPasswordError(error);
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          required
          autoComplete="new-password"
          minLength={6}
          placeholder="At least 6 characters"
          className={passwordError ? "border-red-500" : ""}
        />
        {passwordError && (
          <p className="text-sm text-red-600">{passwordError}</p>
        )}
        {!passwordError && password && password.length >= 6 && (
          <p className="text-sm text-green-600">✓ Password meets requirements</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => handleConfirmPasswordChange(e.target.value)}
          required
          autoComplete="new-password"
          minLength={6}
          placeholder="Confirm your password"
          className={confirmPasswordError ? "border-red-500" : ""}
        />
        {confirmPasswordError && (
          <p className="text-sm text-red-600">{confirmPasswordError}</p>
        )}
        {!confirmPasswordError && confirmPassword && password === confirmPassword && (
          <p className="text-sm text-green-600">✓ Passwords match</p>
        )}
      </div>
    </>
  );
}
