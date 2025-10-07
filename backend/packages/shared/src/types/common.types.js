"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitError = exports.UnauthorizedError = exports.NotFoundError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    code;
    statusCode;
    details;
    constructor(code, message, statusCode = 500, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message, details) {
        super('VALIDATION_ERROR', message, 400, details);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends AppError {
    constructor(resource) {
        super('NOT_FOUND', `${resource} not found`, 404);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super('UNAUTHORIZED', message, 401);
        this.name = 'UnauthorizedError';
    }
}
exports.UnauthorizedError = UnauthorizedError;
class RateLimitError extends AppError {
    constructor(message = 'Rate limit exceeded') {
        super('RATE_LIMIT_EXCEEDED', message, 429);
        this.name = 'RateLimitError';
    }
}
exports.RateLimitError = RateLimitError;
//# sourceMappingURL=common.types.js.map