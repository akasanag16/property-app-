
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export function parseApiError(error: any): ApiError {
  // Handle different error formats
  if (typeof error === 'string') {
    return { message: error };
  }
  
  if (error?.message) {
    return {
      message: error.message,
      code: error.code,
      details: error.details
    };
  }
  
  // Handle Supabase function errors
  if (error?.error) {
    return {
      message: error.error,
      code: error.status?.toString(),
      details: error
    };
  }
  
  // Handle network errors
  if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
    return {
      message: 'Network error. Please check your connection and try again.',
      code: 'NETWORK_ERROR'
    };
  }
  
  return {
    message: 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR',
    details: error
  };
}

export function getErrorMessage(error: ApiError): string {
  // Map specific errors to user-friendly messages
  const errorMappings: Record<string, string> = {
    'already been registered': 'An account with this email already exists. Please sign in with your existing account instead.',
    'already exists': 'An account with this email already exists. Please sign in with your existing account instead.',
    'email addresses': 'Please enter your actual first and last name, not email addresses.',
    'Invalid or expired': 'This invitation link has expired or is invalid. Please request a new invitation.',
    'network': 'Network connection issue. Please check your internet and try again.',
    'timeout': 'Request timed out. Please try again.',
    'NETWORK_ERROR': 'Unable to connect. Please check your internet connection.',
    'UNKNOWN_ERROR': 'Something went wrong. Please try again or contact support if the issue persists.'
  };
  
  // Check if error message contains any known patterns
  for (const [pattern, message] of Object.entries(errorMappings)) {
    if (error.message.toLowerCase().includes(pattern.toLowerCase())) {
      return message;
    }
  }
  
  return error.message || 'An unexpected error occurred. Please try again.';
}

export function shouldShowRetry(error: ApiError): boolean {
  const retryableErrors = ['NETWORK_ERROR', 'timeout', 'network', 'connection'];
  const nonRetryableErrors = ['already exists', 'already been registered', 'email addresses'];
  
  // Don't show retry for user existence errors
  for (const pattern of nonRetryableErrors) {
    if (error.message.toLowerCase().includes(pattern.toLowerCase())) {
      return false;
    }
  }
  
  // Show retry for network and temporary errors
  return retryableErrors.some(pattern => 
    error.code?.toLowerCase().includes(pattern) || 
    error.message.toLowerCase().includes(pattern)
  );
}
