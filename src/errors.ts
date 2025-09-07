// Custom error types for better error handling
export class TokenExpiredError extends Error {
  name = 'TokenExpiredError';
  constructor(message: string) {
    super(message);
  }
}

export class InvalidSignatureError extends Error {
  name = 'InvalidSignatureError';
  constructor(message: string) {
    super(message);
  }
}

export class InvalidTokenError extends Error {
  name = 'InvalidTokenError';
  constructor(message: string) {
    super(message);
  }
}

export class SecurityValidationError extends Error {
  name = 'SecurityValidationError';
  constructor(message: string) {
    super(message);
  }
}