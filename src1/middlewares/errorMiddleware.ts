import { Request, Response, NextFunction } from 'express';
import { IsApiError, ApiError } from '../utils/ApiError'; // Adjust the path to your ApiError
import logger from './logger'; // Adjust the path to your logger

const currentEnv = process.env.NODE_ENV || 'development';

/**
 * Global error handler for all routes
 * @param {ApiError | Error} err - The error object
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 * @param {NextFunction} next - The next middleware function
 */
export const errorHandler = (err: Error | ApiError, _req: Request, res: Response, next: NextFunction): void | Promise<void> => {
  if (res.headersSent) {
    return next(err);
  }

  // Handle known API errors
  if (IsApiError(err)) {
    res.status((err as ApiError).statusCode).json({
      code: (err as ApiError).statusCode,
      message: err.message,
      ...(currentEnv === 'development' ? { stack: err.stack } : {}),
    });
    return;
  }

  // Handle other errors
  if (currentEnv === 'development') {
    logger.error(err.stack);
    res.status(500).json({
      code: 500,
      message: 'Internal Server Error',
      stack: err.stack,
    });
    return;
  }

  logger.error(err);
  res.status(500).json({
    code: 500,
    message: 'Something went wrong. Please try again later.',
  });
};


export default errorHandler; // Default export