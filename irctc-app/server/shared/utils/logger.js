import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple logger implementation
const logDir = path.join(__dirname, '../../../logs');

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const formatMessage = (level, message, meta = {}) => {
    const timestamp = new Date().toISOString();
    return JSON.stringify({
        timestamp,
        level,
        message,
        ...meta
    });
};

const writeLog = (level, message, meta) => {
    const logMessage = formatMessage(level, message, meta);
    
    // Console output
    if (level === 'ERROR') {
        console.error(logMessage);
    } else if (level === 'WARN') {
        console.warn(logMessage);
    } else {
        console.log(logMessage);
    }

    // File output
    const logFile = path.join(logDir, `${level.toLowerCase()}.log`);
    fs.appendFileSync(logFile, logMessage + '\n');
};

export const logger = {
    info: (message, meta) => writeLog('INFO', message, meta),
    error: (message, meta) => writeLog('ERROR', message, meta),
    warn: (message, meta) => writeLog('WARN', message, meta),
    debug: (message, meta) => writeLog('DEBUG', message, meta)
};

// Database specific logger
export const dbLogger = {
    query: (query, params, duration) => {
        logger.debug('Database Query', { 
            query: query.replace(/\s+/g, ' ').trim(), 
            params, 
            durationMs: duration 
        });
    },
    error: (error, query) => {
        logger.error('Database Error', { error: error.message, query });
    }
};
