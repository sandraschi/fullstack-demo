"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
exports.createLogger = createLogger;
exports.logRequest = logRequest;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    static instance;
    logLevel;
    serviceName;
    constructor(serviceName, logLevel = LogLevel.INFO) {
        this.serviceName = serviceName;
        this.logLevel = logLevel;
    }
    static getInstance(serviceName, logLevel) {
        if (!Logger.instance) {
            Logger.instance = new Logger(serviceName, logLevel);
        }
        return Logger.instance;
    }
    shouldLog(level) {
        return level <= this.logLevel;
    }
    formatLog(level, message, data, requestId, userId) {
        return {
            timestamp: new Date().toISOString(),
            level,
            service: this.serviceName,
            message,
            data,
            requestId,
            userId,
        };
    }
    output(entry) {
        const levelName = LogLevel[entry.level];
        const timestamp = entry.timestamp;
        const service = entry.service;
        const message = entry.message;
        const dataStr = entry.data ? ` ${JSON.stringify(entry.data)}` : '';
        const requestIdStr = entry.requestId ? ` [${entry.requestId}]` : '';
        const userIdStr = entry.userId ? ` [user:${entry.userId}]` : '';
        console.log(`[${timestamp}] ${levelName} [${service}]${requestIdStr}${userIdStr} ${message}${dataStr}`);
    }
    error(message, data, requestId, userId) {
        if (this.shouldLog(LogLevel.ERROR)) {
            this.output(this.formatLog(LogLevel.ERROR, message, data, requestId, userId));
        }
    }
    warn(message, data, requestId, userId) {
        if (this.shouldLog(LogLevel.WARN)) {
            this.output(this.formatLog(LogLevel.WARN, message, data, requestId, userId));
        }
    }
    info(message, data, requestId, userId) {
        if (this.shouldLog(LogLevel.INFO)) {
            this.output(this.formatLog(LogLevel.INFO, message, data, requestId, userId));
        }
    }
    debug(message, data, requestId, userId) {
        if (this.shouldLog(LogLevel.DEBUG)) {
            this.output(this.formatLog(LogLevel.DEBUG, message, data, requestId, userId));
        }
    }
    setLogLevel(level) {
        this.logLevel = level;
    }
}
exports.Logger = Logger;
function createLogger(serviceName, logLevel) {
    return Logger.getInstance(serviceName, logLevel);
}
function logRequest(serviceName) {
    const logger = createLogger(serviceName);
    return (req, res, next) => {
        const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        req.requestId = requestId;
        const startTime = Date.now();
        logger.info('Request started', {
            method: req.method,
            url: req.url,
            userAgent: req.headers['user-agent'],
            ip: req.ip,
        }, requestId);
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            logger.info('Request completed', {
                method: req.method,
                url: req.url,
                statusCode: res.statusCode,
                duration: `${duration}ms`,
            }, requestId);
        });
        next();
    };
}
//# sourceMappingURL=logger.js.map