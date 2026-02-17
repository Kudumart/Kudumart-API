// Define the structure for error objects
interface ErrorDetail {
    code: string;
    message: string;
  }
  
  // Default errors as a constant object
  const DEFAULT_ERRORS: Record<string, ErrorDetail> = {
    BAD_TOKEN: {
      code: "BAD_TOKEN",
      message: "Token is not valid",
    },
    TOKEN_EXPIRED: {
      code: "TOKEN_EXPIRED",
      message: "Token expired",
    },
    UNAUTHORIZED: {
      code: "UNAUTHORIZED",
      message: "Invalid credentials",
    },
    SERVER_ERROR: {
      code: "SERVER_ERROR",
      message: "Internal server error",
    },
    NOT_FOUND: {
      code: "NOT_FOUND",
      message: "Not found",
    },
    BAD_REQUEST: {
      code: "BAD_REQUEST",
      message: "Bad request",
    },
    FORBIDDEN: {
      code: "FORBIDDEN",
      message: "Permission denied",
    },
    VALIDATION: {
      code: "VALIDATION",
      message: "Validation error",
    },
  };
  
  /**
   * BaseError class
   * @class
   */
  class BaseError extends Error {
    statusCode: number;
    type: string;
    isOperational: boolean;
  
    constructor(message: string, statusCode: number, type: string, isOperational: boolean) {
      super(message);
      this.type = type;
      this.statusCode = statusCode;
      this.isOperational = isOperational;
  
      // Capture the stack trace
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  /**
   * ApiError class that extends BaseError
   */
  class ApiError extends BaseError {
    constructor(message: string, statusCode: number, type: string) {
      super(message, statusCode, type, true);
    }
  }
  
  /**
   * Helper function to check if error is ApiError
   * @param err - Error object
   * @returns boolean - Is this error an ApiError
   */
  const IsApiError = (err: Error): boolean => {
    return err instanceof ApiError ? (err as ApiError).isOperational : false;
  };
  
  // Custom Error Classes for common HTTP errors
  
  class NotFoundError extends ApiError {
    constructor(
      message: string = DEFAULT_ERRORS.NOT_FOUND.message,
      type: string = DEFAULT_ERRORS.NOT_FOUND.code
    ) {
      super(message, 404, type);
    }
  }
  
  class BadRequestError extends ApiError {
    constructor(
      message: string = DEFAULT_ERRORS.BAD_REQUEST.message,
      type: string = DEFAULT_ERRORS.BAD_REQUEST.code
    ) {
      super(message, 400, type);
    }
  }
  
  class ValidationError extends ApiError {
    constructor(
      message: string = DEFAULT_ERRORS.VALIDATION.message,
      type: string = DEFAULT_ERRORS.VALIDATION.code
    ) {
      super(message, 400, type);
    }
  }
  
  class UnauthorizedError extends ApiError {
    constructor(
      message: string = DEFAULT_ERRORS.UNAUTHORIZED.message,
      type: string = DEFAULT_ERRORS.UNAUTHORIZED.code
    ) {
      super(message, 401, type);
    }
  }
  
  class ForbiddenError extends ApiError {
    constructor(
      message: string = DEFAULT_ERRORS.FORBIDDEN.message,
      type: string = DEFAULT_ERRORS.FORBIDDEN.code
    ) {
      super(message, 403, type);
    }
  }
  
  class InternalServerError extends ApiError {
    constructor(
      message: string = DEFAULT_ERRORS.SERVER_ERROR.message,
      type: string = DEFAULT_ERRORS.SERVER_ERROR.code
    ) {
      super(message, 500, type);
    }
  }
  
  class BadTokenError extends ApiError {
    constructor(
      message: string = DEFAULT_ERRORS.BAD_TOKEN.message,
      type: string = DEFAULT_ERRORS.BAD_TOKEN.code
    ) {
      super(message, 401, type);
    }
  }
  
  class TokenExpiredError extends ApiError {
    constructor(
      message: string = DEFAULT_ERRORS.TOKEN_EXPIRED.message,
      type: string = DEFAULT_ERRORS.TOKEN_EXPIRED.code
    ) {
      super(message, 401, type);
    }
  }
  
  export {
    IsApiError,
    ApiError,
    NotFoundError,
    BadRequestError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    InternalServerError,
    BadTokenError,
    TokenExpiredError,
  };
  