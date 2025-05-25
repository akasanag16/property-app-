
// Email pattern for validation
const emailPattern = /\S+@\S+\.\S+/;

export function validateEmail(email: string): string {
  const normalizedEmail = email.toLowerCase().trim();
  
  if (!emailPattern.test(normalizedEmail)) {
    throw new Error("Invalid email format");
  }
  
  return normalizedEmail;
}

export function validateNames(firstName: string, lastName: string): { firstName: string; lastName: string } {
  // Enhanced validation for names
  if (emailPattern.test(firstName.trim()) || emailPattern.test(lastName.trim())) {
    throw new Error("First name and last name cannot contain email addresses. Please enter your actual first and last name.");
  }

  // Additional name validation
  if (firstName.trim().length === 0 || lastName.trim().length === 0) {
    throw new Error("First name and last name cannot be empty");
  }

  if (firstName.trim().length > 50 || lastName.trim().length > 50) {
    throw new Error("First name and last name must be less than 50 characters");
  }

  return {
    firstName: firstName.trim(),
    lastName: lastName.trim()
  };
}

export function validatePassword(password: string): void {
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
}
