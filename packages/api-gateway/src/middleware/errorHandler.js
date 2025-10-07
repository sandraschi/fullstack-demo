"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const common_types_1 = require("@shared/types/common.types");
const logger_1 = require("@shared/utils/logger");
const logger = (0, logger_1.createLogger)('api-gateway');
function errorHandler(error, req, res, next) {
    const requestId = req.requestId;
    logger.error('Request error', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        query: req.query,
    }, requestId);
    if (error instanceof common_types_1.AppError) {
        res.status(error.statusCode).json({
            success: false,
            error: {
                code: error.code,
                message: error.message,
                details: error.details,
            },
            timestamp: new Date().toISOString(),
            requestId,
        });
        return;
    }
    if (error.name === 'ValidationError') {
        res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: error.message,
            },
            timestamp: new Date().toISOString(),
            requestId,
        });
        return;
    }
    if (error instanceof SyntaxError && 'body' in error) {
        res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_JSON',
                message: 'Invalid JSON in request body',
            },
            timestamp: new Date().toISOString(),
            requestId,
        });
        return;
    }
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : error.message,
        },
        timestamp: new Date().toISOString(),
        requestId,
    });
}
//# sourceMappingURL=errorHandler.js.map