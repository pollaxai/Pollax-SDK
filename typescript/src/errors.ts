/**
 * Custom error class for Pollax API errors
 */
export class PollaxError extends Error {
  public readonly statusCode: number;
  public readonly response?: any;

  constructor(message: string, statusCode: number = 0, response?: any) {
    super(message);
    this.name = 'PollaxError';
    this.statusCode = statusCode;
    this.response = response;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PollaxError);
    }
  }
}

/**
 * Error thrown when authentication fails
 */
export class AuthenticationError extends PollaxError {
  constructor(message: string = 'Authentication failed', response?: any) {
    super(message, 401, response);
    this.name = 'AuthenticationError';
  }
}

/**
 * Error thrown when a requested resource is not found
 */
export class NotFoundError extends PollaxError {
  constructor(message: string = 'Resource not found', response?: any) {
    super(message, 404, response);
    this.name = 'NotFoundError';
  }
}

/**
 * Error thrown when rate limit is exceeded
 */
export class RateLimitError extends PollaxError {
  constructor(message: string = 'Rate limit exceeded', response?: any) {
    super(message, 429, response);
    this.name = 'RateLimitError';
  }
}

/**
 * Error thrown for validation errors
 */
export class ValidationError extends PollaxError {
  constructor(message: string = 'Validation error', response?: any) {
    super(message, 400, response);
    this.name = 'ValidationError';
  }
}
