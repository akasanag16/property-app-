
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, User } from "lucide-react";

interface EnhancedNameInputsProps {
  firstName: string;
  lastName: string;
  onFirstNameChange: (firstName: string) => void;
  onLastNameChange: (lastName: string) => void;
  onErrorClear: () => void;
}

const EMAIL_PATTERN = /\S+@\S+\.\S+/;
const INVALID_CHARS_PATTERN = /[@.]+/;

function validateNameField(value: string, fieldName: string) {
  const trimmedValue = value.trim();
  
  if (!trimmedValue) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  if (EMAIL_PATTERN.test(trimmedValue)) {
    return { 
      isValid: false, 
      message: `${fieldName} cannot be an email address. Please enter your actual ${fieldName.toLowerCase()}.` 
    };
  }
  
  if (INVALID_CHARS_PATTERN.test(trimmedValue)) {
    return { 
      isValid: false, 
      message: `${fieldName} cannot contain @ or . symbols. Please enter your actual ${fieldName.toLowerCase()}.` 
    };
  }
  
  if (trimmedValue.length > 50) {
    return { 
      isValid: false, 
      message: `${fieldName} must be less than 50 characters` 
    };
  }
  
  if (trimmedValue.length < 2) {
    return { 
      isValid: false, 
      message: `${fieldName} must be at least 2 characters` 
    };
  }
  
  return { isValid: true, message: null };
}

export function EnhancedNameInputs({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  onErrorClear
}: EnhancedNameInputsProps) {
  const [firstNameValidation, setFirstNameValidation] = useState({ isValid: true, message: null });
  const [lastNameValidation, setLastNameValidation] = useState({ isValid: true, message: null });
  const [showWarning, setShowWarning] = useState(false);

  const handleFirstNameChange = (value: string) => {
    // Prevent common email-like entries
    if (value.includes('@') && value.length > firstName.length) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    }
    
    onFirstNameChange(value);
    onErrorClear();
    
    const validation = validateNameField(value, "First name");
    setFirstNameValidation(validation);
  };

  const handleLastNameChange = (value: string) => {
    // Prevent common email-like entries
    if (value.includes('@') && value.length > lastName.length) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    }
    
    onLastNameChange(value);
    onErrorClear();
    
    const validation = validateNameField(value, "Last name");
    setLastNameValidation(validation);
  };

  const getInputClassName = (isValid: boolean, hasValue: boolean) => {
    if (!hasValue) return "";
    return isValid ? "border-green-500 focus:border-green-600" : "border-red-500 focus:border-red-600";
  };

  const getStatusIcon = (isValid: boolean, hasValue: boolean) => {
    if (!hasValue) return <User className="h-4 w-4 text-gray-400" />;
    return isValid ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-4">
      {showWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-800">Please enter your name, not your email</p>
            <p className="text-yellow-700">This field should contain your actual first and last name.</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="flex items-center gap-2">
            First Name
            <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => handleFirstNameChange(e.target.value)}
              required
              autoComplete="given-name"
              placeholder="Enter your first name"
              maxLength={50}
              className={getInputClassName(firstNameValidation.isValid, !!firstName)}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {getStatusIcon(firstNameValidation.isValid, !!firstName)}
            </div>
          </div>
          {firstNameValidation.message && (
            <p className="text-sm text-red-600 flex items-start gap-1">
              <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              {firstNameValidation.message}
            </p>
          )}
          {firstNameValidation.isValid && firstName && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Valid first name
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName" className="flex items-center gap-2">
            Last Name
            <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => handleLastNameChange(e.target.value)}
              required
              autoComplete="family-name"
              placeholder="Enter your last name"
              maxLength={50}
              className={getInputClassName(lastNameValidation.isValid, !!lastName)}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {getStatusIcon(lastNameValidation.isValid, !!lastName)}
            </div>
          </div>
          {lastNameValidation.message && (
            <p className="text-sm text-red-600 flex items-start gap-1">
              <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              {lastNameValidation.message}
            </p>
          )}
          {lastNameValidation.isValid && lastName && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Valid last name
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
