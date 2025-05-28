
import { createErrorResponse, createSuccessResponse } from "./utils.ts";
import { validateCreateUserRequest, validateUserDetails } from "./validation/create-user-validation.ts";
import { validateInvitation, markInvitationAsUsed } from "./services/invitation-service.ts";
import { createPropertyLink } from "./services/property-link-service.ts";

export async function createInvitedUser(requestData: any) {
  try {
    // Validate and extract request data
    const validatedRequest = validateCreateUserRequest(requestData);
    const { token, email, propertyId, role, firstName, lastName, password } = validatedRequest;

    // Validate user details and get normalized values
    const { normalizedEmail, validFirstName, validLastName } = validateUserDetails(email, firstName, lastName, password);

    console.log(`Processing invitation for: ${normalizedEmail} as ${role}`);
    console.log(`Property ID: ${propertyId}`);
    console.log(`Names: ${validFirstName} ${validLastName}`);

    // Validate invitation token first
    const { invitation, tableName } = await validateInvitation(token, normalizedEmail, role);

    // Check if user already exists - but don't throw error, return info instead
    const { getSupabaseClient } = await import("./utils.ts");
    const supabase = getSupabaseClient();
    
    const { data: existingUser, error: userCheckError } = await supabase.auth.admin.getUserByEmail(normalizedEmail);
    
    if (userCheckError && !userCheckError.message.includes('User not found')) {
      console.error("Error checking user existence:", userCheckError);
      throw new Error("Failed to verify user account status");
    }

    if (existingUser?.user) {
      console.log(`User with email ${normalizedEmail} already exists - returning guidance to use existing account flow`);
      
      return createSuccessResponse({ 
        success: false,
        userExists: true,
        requiresLinking: true,
        userId: existingUser.user.id,
        message: 'An account with this email already exists. Please use the "I already have an account" option to link your existing account.',
        guidance: 'switch_to_existing_flow'
      });
    }

    // User doesn't exist, proceed with creation
    const { createAuthUser, createUserProfile } = await import("./services/user-creation-service.ts");
    
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
    if (error.message?.includes("email addresses")) {
      return createErrorResponse('Please enter your actual first and last name, not email addresses.', 400);
    } else if (error.message?.includes("Invalid or expired")) {
      return createErrorResponse('This invitation link has expired or is invalid. Please request a new invitation.', 400);
    } else if (error.message?.includes("network") || error.message?.includes("timeout")) {
      return createErrorResponse('Network error. Please check your connection and try again.', 400);
    }
    
    return createErrorResponse(error.message || 'An unexpected error occurred', 500);
  }
}
