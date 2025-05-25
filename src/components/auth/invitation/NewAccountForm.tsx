
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, ArrowLeft, Info } from "lucide-react";
import { UserRole } from "@/lib/auth";
import { validateAccountForm } from "./utils/formValidation";
import { PasswordInputs } from "./components/PasswordInputs";
import { NameInputs } from "./components/NameInputs";
import { useNewAccountSubmission } from "./hooks/useNewAccountSubmission";

interface NewAccountFormProps {
  email: string;
  token: string;
  propertyId: string;
  role: UserRole;
  onToggleMode: () => void;
  onBackToLogin: () => void;
  setError: (error: string) => void;
  error: string;
}

export function NewAccountForm({
  email,
  token,
  propertyId,
  role,
  onToggleMode,
  onBackToLogin,
  setError,
  error
}: NewAccountFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { loading, handleSubmit } = useNewAccountSubmission({
    email,
    token,
    propertyId,
    role,
    onToggleMode,
    setError
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateAccountForm(firstName, lastName, password, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    await handleSubmit(firstName, lastName, password);
  };

  const clearError = () => {
    if (error) setError("");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Helpful instructions */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Please enter your actual first and last name. Do not use email addresses in the name fields.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <NameInputs
        firstName={firstName}
        lastName={lastName}
        onFirstNameChange={setFirstName}
        onLastNameChange={setLastName}
        onErrorClear={clearError}
      />
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} readOnly className="bg-gray-100" />
      </div>
      
      <PasswordInputs
        password={password}
        confirmPassword={confirmPassword}
        onPasswordChange={setPassword}
        onConfirmPasswordChange={setConfirmPassword}
        onErrorClear={clearError}
      />
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
      
      <div className="text-center text-sm">
        <button 
          type="button" 
          className="text-primary hover:underline"
          onClick={onToggleMode}
          disabled={loading}
        >
          I already have an account
        </button>
      </div>
      
      <Button 
        type="button" 
        variant="outline" 
        className="w-full flex items-center justify-center" 
        onClick={onBackToLogin}
        disabled={loading}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Login
      </Button>
    </form>
  );
}
