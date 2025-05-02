
import { UserRole } from "@/lib/auth";
import { ExistingAccountForm } from "./ExistingAccountForm";
import { NewAccountForm } from "./NewAccountForm";

interface FormModeSwitcherProps {
  mode: 'new' | 'existing';
  email: string;
  token: string;
  propertyId: string;
  role: UserRole;
  invitationType?: string;
  error: string;
  setError: (error: string) => void;
  onToggleMode: () => void;
  onBackToLogin: () => void;
}

export function FormModeSwitcher({
  mode,
  email,
  token,
  propertyId,
  role,
  invitationType,
  error,
  setError,
  onToggleMode,
  onBackToLogin
}: FormModeSwitcherProps) {
  if (mode === 'existing') {
    return (
      <ExistingAccountForm 
        email={email}
        token={token}
        propertyId={propertyId}
        role={role}
        error={error}
        setError={setError}
        onToggleMode={onToggleMode}
        onBackToLogin={onBackToLogin}
      />
    );
  }

  return (
    <NewAccountForm 
      email={email}
      token={token}
      propertyId={propertyId}
      role={role}
      error={error}
      setError={setError}
      onToggleMode={onToggleMode}
      onBackToLogin={onBackToLogin}
    />
  );
}
