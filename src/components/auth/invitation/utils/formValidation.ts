
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
    return "Names cannot contain email addresses";
  }
  
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  
  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }
  
  return null;
};
