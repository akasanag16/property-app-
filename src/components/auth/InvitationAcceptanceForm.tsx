
import { useNavigate } from "react-router-dom";
import { UserRole } from "@/lib/auth";
import { ExistingAccountForm } from "./invitation/ExistingAccountForm";
import { useState } from "react";

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

  const handleBackToLogin = () => {
    navigate("/auth");
  };

  return (
    <ExistingAccountForm
      email={email}
      token={token}
      propertyId={propertyId}
      role={role}
      error={error}
      setError={setError}
      onBackToLogin={handleBackToLogin}
    />
  );
}
