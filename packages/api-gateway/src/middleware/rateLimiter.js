"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ttsRateLimiter = exports.imageRateLimiter = exports.chatRateLimiter = void 0;
exports.rateLimiter = rateLimiter;
const common_types_1 = require("@shared/types/common.types");
const logger_1 = require("@shared/utils/logger");
const logger = (0, logger_1.createLogger)('api-gateway');
const store = {};
const defaultConfig = {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
    keyGenerator: (req) => {
        return req.ip || req.connection.remoteAddress || 'unknown';
    },
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
};
function rateLimiter(config = {}) {
    const finalConfig = { ...defaultConfig, ...config };
    const keyGenerator = finalConfig.keyGenerator;
    return (req, res, next) => {
        const key = keyGenerator(req);
        const now = Date.now();
        const windowStart = now - finalConfig.windowMs;
        Object.keys(store).forEach(storeKey => {
            if (store[storeKey].resetTime < now) {
                delete store[storeKey];
            }
        });
        if (!store[key] || store[key].resetTime < now) {
            store[key] = {
                count: 0,
                resetTime: now + finalConfig.windowMs,
            };
        }
        const entry = store[key];
        entry.count++;
        res.set({
            'X-RateLimit-Limit': finalConfig.maxRequests.toString(),
            'X-RateLimit-Remaining': Math.max(0, finalConfig.maxRequests - entry.count).toString(),
            'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
        });
        if (entry.count > finalConfig.maxRequests) {
            logger.warn('Rate limit exceeded', {
                key,
                count: entry.count,
                limit: finalConfig.maxRequests,
                windowMs: finalConfig.windowMs,
                ip: req.ip,
                userAgent: req.headers['user-agent'],
            }, req.requestId);
            throw new common_types_1.RateLimitError(`Rate limit exceeded. Try again in ${Math.ceil((entry.resetTime - now) / 1000)} seconds.`);
        }
        if (entry.count % 10 === 0) {
            logger.debug('Rate limit status', {
                key,
                count: entry.count,
                limit: finalConfig.maxRequests,
                remaining: finalConfig.maxRequests - entry.count,
            }, req.requestId);
        }
        next();
    };
}
exports.chatRateLimiter = rateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 10,
});
exports.imageRateLimiter = rateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 5,
});
exports.ttsRateLimiter = rateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 20,
});
//# sourceMappingURL=rateLimiter.js.map