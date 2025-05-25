
import { validateEmail, validateNames, validatePassword } from "./email-validation.ts";

export interface CreateUserRequest {
  token: string;
  email: string;
  propertyId: string;
  role: string;
  firstName: string;
  lastName: string;
  password: string;
}

export function validateCreateUserRequest(requestData: any): CreateUserRequest {
  const { token, email, propertyId, role, firstName, lastName, password } = requestData;
  
  console.log("Create invited user request data:", { 
    token: token ? "present" : "missing",
    email,
    propertyId,
    role,
    firstName,
    lastName,
    password: password ? "present" : "missing"
  });
  
  if (!token || !email || !propertyId || !role) {
    const missingParams = [];
    if (!token) missingParams.push('token');
    if (!email) missingParams.push('email');
    if (!propertyId) missingParams.push('propertyId');
    if (!role) missingParams.push('role');
    
    console.error("Missing required parameters:", missingParams);
    throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
  }

  if (!firstName || !lastName || !password) {
    console.error("Missing user creation parameters:", { firstName: !!firstName, lastName: !!lastName, password: !!password });
    throw new Error("First name, last name, and password are required for creating a new user");
  }

  return {
    token,
    email,
    propertyId,
    role,
    firstName,
    lastName,
    password
  };
}

export function validateUserDetails(email: string, firstName: string, lastName: string, password: string) {
  // Validate email format and normalize
  const normalizedEmail = validateEmail(email);

  // Validate names
  const { firstName: validFirstName, lastName: validLastName } = validateNames(firstName, lastName);

  // Validate password
  validatePassword(password);

  return {
    normalizedEmail,
    validFirstName,
    validLastName
  };
}
