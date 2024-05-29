const winston = require('winston');
require('winston-daily-rotate-file');

/**
 * @module Logger
 *
 * This module sets up and exports a logger using the winston library.
 * The logger is configured to handle different levels of logging, output logs to both console and files,
 * and manage log rotation on a daily basis.
 *
 * Features:
 * - Custom log levels and colors
 * - Timestamping and formatting of log messages
 * - Output to console with colorized messages
 * - File logging for errors
 * - Daily log rotation for combined logs
 */

// Define custom log levels and their colors
const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        debug: 4,
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'magenta',
        debug: 'blue',
    }
};

// Create a logger instance with the specified configurations
const logger = winston.createLogger({
    levels: customLevels.levels, // Use custom log levels
    format: winston.format.combine(
        winston.format.timestamp(), // Add timestamps to log messages
        winston.format.errors({ stack: true }), // Include stack trace for errors
        winston.format.json() // Format logs as JSON
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(), // Colorize log messages for the console
                winston.format.simple() // Simplify log message format for the console
            ),
        }),
        new winston.transports.File({
            filename: 'logs/error.log', // Log file for error messages
            level: 'error', // Only log errors to this file
        }),
        new winston.transports.DailyRotateFile({
            filename: 'logs/combined-%DATE%.log', // Log file pattern for daily rotation
            datePattern: 'YYYY-MM-DD', // Date pattern for log file names
            maxSize: '7m', // Maximum size of log files before rotation
            maxFiles: '14d', // Maximum number of days to keep log files
        }),
    ],
    exitOnError: false, // Do not exit the process on handled exceptions
});

// Add custom colors to winston
winston.addColors(customLevels.colors);

// Export the logger instance for use in other modules
module.exports = logger;
