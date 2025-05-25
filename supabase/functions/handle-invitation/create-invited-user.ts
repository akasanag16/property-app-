
import { createErrorResponse, createSuccessResponse } from "./utils.ts";
import { validateCreateUserRequest } from "./validation/request-validation.ts";
import { validateEmail, validateNames, validatePassword } from "./validation/email-validation.ts";
import { validateInvitation, markInvitationAsUsed } from "./services/invitation-service.ts";
import { checkExistingUser, createAuthUser, createUserProfile } from "./services/user-service.ts";
import { createPropertyLink } from "./services/property-link-service.ts";

export async function createInvitedUser(requestData: any) {
  try {
    // Validate and extract request data
    const validatedRequest = validateCreateUserRequest(requestData);
    const { token, email, propertyId, role, firstName, lastName, password } = validatedRequest;

    // Validate email format and normalize
    const normalizedEmail = validateEmail(email);

    // Validate names
    const { firstName: validFirstName, lastName: validLastName } = validateNames(firstName, lastName);

    // Validate password
    validatePassword(password);

    console.log(`Processing invitation for: ${normalizedEmail} as ${role}`);
    console.log(`Property ID: ${propertyId}`);
    console.log(`Names: ${validFirstName} ${validLastName}`);

    // Check if user already exists
    await checkExistingUser(normalizedEmail);

    // Validate invitation token
    const { invitation, tableName } = await validateInvitation(token, normalizedEmail, role);

    // Create new user account
    const userId = await createAuthUser(normalizedEmail, password, validFirstName, validLastName, role);

    // Create user profile
    await createUserProfile(userId, normalizedEmail, validFirstName, validLastName, role);

    // Mark invitation as used
    await markInvitationAsUsed(tableName, token, normalizedEmail, userId);

    // Create property link
    await createPropertyLink(propertyId, userId, role);

    console.log('User successfully created and linked to property');

    return createSuccessResponse({ 
      success: true, 
      userExists: false,
      userLinked: true,
      userId: userId,
      message: 'Account created successfully'
    });

  } catch (error: any) {
    console.error('Error in createInvitedUser:', error);
    
    // Handle specific error cases with better user feedback
    if (error.message?.includes("already been registered") || 
        error.message?.includes("email_exists") ||
        error.message?.includes("already exists")) {
      return createErrorResponse('An account with this email already exists. Please use the existing account option.', 400);
    } else if (error.message?.includes("email addresses")) {
      return createErrorResponse('Please enter your actual first and last name, not email addresses.', 400);
    } else if (error.message?.includes("Invalid or expired")) {
      return createErrorResponse('This invitation link has expired or is invalid. Please request a new invitation.', 400);
    } else if (error.message?.includes("network") || error.message?.includes("timeout")) {
      return createErrorResponse('Network error. Please check your connection and try again.', 400);
    }
    
    return createErrorResponse(error.message || 'An unexpected error occurred', 500);
  }
}
