import fs from 'fs';
import path from 'path';
import { createLogger, format, transports, Logger } from 'winston';
import { TransformableInfo } from 'logform'; // Import this type from logform
const { combine, timestamp, printf } = format;

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Correct typing for info object, making timestamp optional
const myFormat = printf(({ level, message, timestamp }: Partial<TransformableInfo> & { timestamp?: string }) => {
  return `${timestamp || 'no-timestamp'} ${level}: ${message}`;
});

// Create the logger instance
const logger: Logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(), // Add the timestamp to the format
    myFormat
  ),
  transports: [
    new transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' }),
    new transports.File({ filename: path.join(logsDir, 'combined.log') })
  ]
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.simple()
  }));
}

export default logger;
