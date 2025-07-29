import DOMPurify from 'dompurify';

/**
 * Security utilities for input validation and sanitization
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // Strip all HTML tags
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
};

/**
 * Sanitize text content while allowing basic formatting
 */
export const sanitizeText = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
};

/**
 * Validate email format with enhanced security checks
 */
export const validateEmail = (email: string): boolean => {
  // Basic format check
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  
  if (!email || typeof email !== 'string') return false;
  if (email.length > 320) return false; // RFC 5321 limit
  if (email.includes('..')) return false; // No consecutive dots
  if (email.startsWith('.') || email.endsWith('.')) return false;
  
  return emailRegex.test(email);
};

/**
 * Validate property name/address input
 */
export const validateTextInput = (input: string, maxLength = 255): { isValid: boolean; sanitized: string } => {
  if (!input || typeof input !== 'string') {
    return { isValid: false, sanitized: '' };
  }
  
  const sanitized = sanitizeHtml(input.trim());
  const isValid = sanitized.length > 0 && sanitized.length <= maxLength;
  
  return { isValid, sanitized };
};

/**
 * Validate maintenance request content
 */
export const validateMaintenanceContent = (content: string): { isValid: boolean; sanitized: string } => {
  if (!content || typeof content !== 'string') {
    return { isValid: false, sanitized: '' };
  }
  
  const sanitized = sanitizeText(content.trim());
  const isValid = sanitized.length > 0 && sanitized.length <= 5000;
  
  return { isValid, sanitized };
};

/**
 * Rate limiting storage for client-side protection
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple client-side rate limiting
 */
export const checkRateLimit = (key: string, maxAttempts = 5, windowMs = 300000): boolean => {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxAttempts) {
    return false;
  }
  
  record.count++;
  return true;
};

/**
 * Generate secure random string for client-side use
 */
export const generateSecureId = (): string => {
  return crypto.randomUUID();
};

/**
 * Prevent timing attacks by adding consistent delay
 */
export const addSecurityDelay = async (minMs = 100, maxMs = 300): Promise<void> => {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  await new Promise(resolve => setTimeout(resolve, delay));
};