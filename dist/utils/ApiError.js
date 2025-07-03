"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenExpiredError = exports.BadTokenError = exports.InternalServerError = exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.BadRequestError = exports.NotFoundError = exports.ApiError = exports.IsApiError = void 0;
// Default errors as a constant object
const DEFAULT_ERRORS = {
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
    constructor(message, statusCode, type, isOperational) {
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
    constructor(message, statusCode, type) {
        super(message, statusCode, type, true);
    }
}
exports.ApiError = ApiError;
/**
 * Helper function to check if error is ApiError
 * @param err - Error object
 * @returns boolean - Is this error an ApiError
 */
const IsApiError = (err) => {
    return err instanceof ApiError ? err.isOperational : false;
};
exports.IsApiError = IsApiError;
// Custom Error Classes for common HTTP errors
class NotFoundError extends ApiError {
    constructor(message = DEFAULT_ERRORS.NOT_FOUND.message, type = DEFAULT_ERRORS.NOT_FOUND.code) {
        super(message, 404, type);
    }
}
exports.NotFoundError = NotFoundError;
class BadRequestError extends ApiError {
    constructor(message = DEFAULT_ERRORS.BAD_REQUEST.message, type = DEFAULT_ERRORS.BAD_REQUEST.code) {
        super(message, 400, type);
    }
}
exports.BadRequestError = BadRequestError;
class ValidationError extends ApiError {
    constructor(message = DEFAULT_ERRORS.VALIDATION.message, type = DEFAULT_ERRORS.VALIDATION.code) {
        super(message, 400, type);
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends ApiError {
    constructor(message = DEFAULT_ERRORS.UNAUTHORIZED.message, type = DEFAULT_ERRORS.UNAUTHORIZED.code) {
        super(message, 401, type);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends ApiError {
    constructor(message = DEFAULT_ERRORS.FORBIDDEN.message, type = DEFAULT_ERRORS.FORBIDDEN.code) {
        super(message, 403, type);
    }
}
exports.ForbiddenError = ForbiddenError;
class InternalServerError extends ApiError {
    constructor(message = DEFAULT_ERRORS.SERVER_ERROR.message, type = DEFAULT_ERRORS.SERVER_ERROR.code) {
        super(message, 500, type);
    }
}
exports.InternalServerError = InternalServerError;
class BadTokenError extends ApiError {
    constructor(message = DEFAULT_ERRORS.BAD_TOKEN.message, type = DEFAULT_ERRORS.BAD_TOKEN.code) {
        super(message, 401, type);
    }
}
exports.BadTokenError = BadTokenError;
class TokenExpiredError extends ApiError {
    constructor(message = DEFAULT_ERRORS.TOKEN_EXPIRED.message, type = DEFAULT_ERRORS.TOKEN_EXPIRED.code) {
        super(message, 401, type);
    }
}
exports.TokenExpiredError = TokenExpiredError;
//# sourceMappingURL=ApiError.js.map