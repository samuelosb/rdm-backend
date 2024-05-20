const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'project-service' },
    transports: [
        new winston.transports.File({
            filename: 'logs/combined.log'
        }),
    ],
});
module.exports = logger;