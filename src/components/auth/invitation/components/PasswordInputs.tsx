
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            onPasswordChange(e.target.value);
            onErrorClear();
          }}
          required
          autoComplete="new-password"
          minLength={6}
          placeholder="At least 6 characters"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            onConfirmPasswordChange(e.target.value);
            onErrorClear();
          }}
          required
          autoComplete="new-password"
          minLength={6}
          placeholder="Confirm your password"
        />
      </div>
    </>
  );
}
