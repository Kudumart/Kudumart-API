"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const ApiError_1 = require("../utils/ApiError"); // Adjust the path to your ApiError
const logger_1 = __importDefault(require("./logger")); // Adjust the path to your logger
const currentEnv = process.env.NODE_ENV || 'development';
/**
 * Global error handler for all routes
 * @param {ApiError | Error} err - The error object
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 * @param {NextFunction} next - The next middleware function
 */
const errorHandler = (err, _req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    // Handle known API errors
    if ((0, ApiError_1.IsApiError)(err)) {
        res.status(err.statusCode).json(Object.assign({ code: err.statusCode, message: err.message }, (currentEnv === 'development' ? { stack: err.stack } : {})));
        return;
    }
    // Handle other errors
    if (currentEnv === 'development') {
        logger_1.default.error(err.stack);
        res.status(500).json({
            code: 500,
            message: 'Internal Server Error',
            stack: err.stack,
        });
        return;
    }
    logger_1.default.error(err);
    res.status(500).json({
        code: 500,
        message: 'Something went wrong. Please try again later.',
    });
};
exports.errorHandler = errorHandler;
exports.default = exports.errorHandler; // Default export
//# sourceMappingURL=errorMiddleware.js.map