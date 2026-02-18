/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.path}:`, err);

    // Validation errors from express-validator
    if (err.type === 'validation') {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: err.errors,
        });
    }

    // Supabase / DB errors
    if (err.code && err.message) {
        return res.status(500).json({
            success: false,
            error: 'Database error',
            message: process.env.NODE_ENV === 'development' ? err.message : 'An internal error occurred',
        });
    }

    // Default error
    const statusCode = err.statusCode || err.status || 500;
    return res.status(statusCode).json({
        success: false,
        error: err.message || 'Internal Server Error',
    });
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.path} not found`,
    });
}

module.exports = { errorHandler, notFoundHandler };
