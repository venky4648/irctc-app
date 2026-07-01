import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
    // Log the error
    logger.error(`Error processing request: ${req.method} ${req.url}`, {
        error: err.message,
        stack: err.stack,
        body: req.body,
        query: req.query,
        params: req.params,
        ip: req.ip
    });

    // Handle database connection errors
    if (err.code === 'ECONNREFUSED' || err.code === '57P03') {
        return res.status(503).json({
            success: false,
            message: 'Database connection failed. Please try again later.'
        });
    }

    // Handle standard Postgres errors (e.g., unique violation)
    if (err.code === '23505') {
        return res.status(409).json({
            success: false,
            message: 'A resource with that identifier already exists.'
        });
    }

    // Default error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message: process.env.NODE_ENV === 'production' && statusCode === 500 ? 'Internal Server Error' : message
    });
};

// Async wrapper to avoid try/catch blocks in controllers
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
