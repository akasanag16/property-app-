
import { createErrorResponse, createSuccessResponse } from "./utils.ts";
import { validateLinkUserRequest } from "./validation/link-user-validation.ts";
import { linkUserToProperty } from "./services/user-linking-service.ts";

export async function linkExistingUser(requestData: any) {
  try {
    // Validate request parameters
    const { token, email, propertyId, role, userId } = validateLinkUserRequest(requestData);
    
    console.log(`Linking existing user with email ${email} to property ${propertyId} as ${role}`);
    
    // Link user to property
    const result = await linkUserToProperty(token, email, propertyId, role, userId);

    return createSuccessResponse({ 
      success: true, 
      ...result,
      message: 'Successfully linked to property'
    });
  } catch (error: any) {
    console.error('Error linking existing user:', error);
    return createErrorResponse(error.message || 'Failed to link user to property', 500);
  }
}
