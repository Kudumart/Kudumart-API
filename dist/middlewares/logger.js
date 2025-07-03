"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const winston_1 = require("winston");
const { combine, timestamp, printf } = winston_1.format;
// Ensure logs directory exists
const logsDir = path_1.default.join(__dirname, '../logs');
if (!fs_1.default.existsSync(logsDir)) {
    fs_1.default.mkdirSync(logsDir);
}
// Correct typing for info object, making timestamp optional
const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp || 'no-timestamp'} ${level}: ${message}`;
});
// Create the logger instance
const logger = (0, winston_1.createLogger)({
    level: 'info',
    format: combine(timestamp(), // Add the timestamp to the format
    myFormat),
    transports: [
        new winston_1.transports.File({ filename: path_1.default.join(logsDir, 'error.log'), level: 'error' }),
        new winston_1.transports.File({ filename: path_1.default.join(logsDir, 'combined.log') })
    ]
});
// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston_1.transports.Console({
        format: winston_1.format.simple()
    }));
}
exports.default = logger;
//# sourceMappingURL=logger.js.map