
import { validateEmail } from "./email-validation.ts";

export interface LinkUserRequest {
  token: string;
  email: string;
  propertyId: string;
  role: string;
  userId: string;
}

export function validateLinkUserRequest(requestData: any): LinkUserRequest {
  const { token, email, propertyId, role, userId } = requestData;
  
  console.log("Link existing user request data:", { 
    token: token ? "present" : "missing",
    email,
    propertyId,
    role,
    userId: userId ? "present" : "missing"
  });
  
  if (!token || !email || !propertyId || !role || !userId) {
    const missingParams = [];
    if (!token) missingParams.push('token');
    if (!email) missingParams.push('email');
    if (!propertyId) missingParams.push('propertyId');
    if (!role) missingParams.push('role');
    if (!userId) missingParams.push('userId');
    
    console.error("Missing parameters:", missingParams);
    throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
  }

  // Validate and normalize email
  const normalizedEmail = validateEmail(email);

  return {
    token,
    email: normalizedEmail,
    propertyId,
    role,
    userId
  };
}
