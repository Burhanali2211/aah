/**
 * Security Utilities
 *
 * Input sanitization and rate limiting utilities
 */

/**
 * Sanitize input to prevent XSS attacks
 * Removes angle brackets, javascript: protocol, and event handlers
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';

  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Rate limiting helper
 * Creates a rate limiter function with configurable request limits and time windows
 */
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();

  return (identifier: string): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get existing requests for this identifier
    const userRequests = requests.get(identifier) || [];

    // Filter out old requests
    const recentRequests = userRequests.filter(time => time > windowStart);

    // Check if limit exceeded
    if (recentRequests.length >= maxRequests) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    requests.set(identifier, recentRequests);

    return true;
  };
};

/**
 * Pre-configured rate limiter for user creation
 * Allows 5 requests per minute
 */
export const userCreationLimiter = createRateLimiter(5, 60000);

/**
 * Pre-configured rate limiter for email sending
 * Allows 3 emails per 5 minutes
 */
export const emailSendLimiter = createRateLimiter(3, 300000);
