
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserRole } from "@/lib/auth";
import { FormModeSwitcher } from "./invitation/FormModeSwitcher";

interface InvitationAcceptanceFormProps {
  email: string;
  token: string;
  propertyId: string;
  role: UserRole;
  invitationType?: string;
}

export function InvitationAcceptanceForm({ 
  email, 
  token, 
  propertyId, 
  role, 
  invitationType
}: InvitationAcceptanceFormProps) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [mode, setMode] = useState<'new' | 'existing'>('existing'); // Default to existing account mode

  const handleBackToLogin = () => {
    navigate("/auth");
  };

  const toggleMode = () => {
    setMode(mode === 'new' ? 'existing' : 'new');
    setError("");
  };

  return (
    <FormModeSwitcher
      mode={mode}
      email={email}
      token={token}
      propertyId={propertyId}
      role={role}
      invitationType={invitationType}
      error={error}
      setError={setError}
      onToggleMode={toggleMode}
      onBackToLogin={handleBackToLogin}
    />
  );
}
