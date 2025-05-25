
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { validateName } from "../utils/formValidation";

interface NameInputsProps {
  firstName: string;
  lastName: string;
  onFirstNameChange: (firstName: string) => void;
  onLastNameChange: (lastName: string) => void;
  onErrorClear: () => void;
}

export function NameInputs({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  onErrorClear
}: NameInputsProps) {
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);

  const handleFirstNameChange = (value: string) => {
    onFirstNameChange(value);
    onErrorClear();
    
    // Real-time validation
    const error = validateName(value, "First name");
    setFirstNameError(error);
  };

  const handleLastNameChange = (value: string) => {
    onLastNameChange(value);
    onErrorClear();
    
    // Real-time validation
    const error = validateName(value, "Last name");
    setLastNameError(error);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          value={firstName}
          onChange={(e) => handleFirstNameChange(e.target.value)}
          required
          autoComplete="given-name"
          placeholder="Enter your first name"
          className={firstNameError ? "border-red-500" : ""}
        />
        {firstNameError && (
          <p className="text-sm text-red-600">{firstNameError}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          value={lastName}
          onChange={(e) => handleLastNameChange(e.target.value)}
          required
          autoComplete="family-name"
          placeholder="Enter your last name"
          className={lastNameError ? "border-red-500" : ""}
        />
        {lastNameError && (
          <p className="text-sm text-red-600">{lastNameError}</p>
        )}
        {!lastNameError && lastName && (
          <p className="text-sm text-green-600">✓ Valid last name</p>
        )}
      </div>
    </div>
  );
}
