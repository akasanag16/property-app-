
// Email pattern for validation
const emailPattern = /\S+@\S+\.\S+/;

export const validateAccountForm = (
  firstName: string,
  lastName: string,
  password: string,
  confirmPassword: string
): string | null => {
  if (!firstName.trim()) {
    return "First name is required";
  }
  
  if (!lastName.trim()) {
    return "Last name is required";
  }
  
  // Check if names contain email patterns
  if (emailPattern.test(firstName) || emailPattern.test(lastName)) {
    return "Names cannot contain email addresses. Please enter your actual first and last name.";
  }
  
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  
  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }
  
  return null;
};

// Real-time validation for individual fields
export const validateName = (name: string, fieldName: string): string | null => {
  if (!name.trim()) {
    return `${fieldName} is required`;
  }
  
  if (emailPattern.test(name)) {
    return `${fieldName} cannot be an email address. Please enter your actual ${fieldName.toLowerCase()}.`;
  }
  
  if (name.length > 50) {
    return `${fieldName} must be less than 50 characters`;
  }
  
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }
  
  return null;
};

export const validatePasswordConfirmation = (password: string, confirmPassword: string): string | null => {
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  
  return null;
};
