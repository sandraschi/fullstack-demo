"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthMonitor = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("@shared/utils/logger");
const health_1 = require("@shared/utils/health");
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const health_2 = require("./routes/health");
const chat_1 = require("./routes/chat");
const image_1 = require("./routes/image");
const tts_1 = require("./routes/tts");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const logger = (0, logger_1.createLogger)('api-gateway');
const port = process.env.PORT || 3000;
const healthMonitor = (0, health_1.createHealthMonitor)({
    serviceId: 'api-gateway',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
});
exports.healthMonitor = healthMonitor;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, logger_1.logRequest)('api-gateway'));
app.use(rateLimiter_1.rateLimiter);
app.get('/health', (0, health_1.createHealthEndpoint)(healthMonitor));
app.use('/api/health', health_2.healthRoutes);
app.use('/api/chat', chat_1.chatRoutes);
app.use('/api/image', image_1.imageRoutes);
app.use('/api/tts', tts_1.ttsRoutes);
app.get('/', (req, res) => {
    res.json({
        service: 'API Gateway',
        version: process.env.npm_package_version || '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/health',
            api: {
                health: '/api/health',
                chat: '/api/chat',
                image: '/api/image',
                tts: '/api/tts',
            },
        },
    });
});
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString(),
    });
});
app.use(errorHandler_1.errorHandler);
const server = app.listen(port, () => {
    logger.info(`API Gateway started on port ${port}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});
//# sourceMappingURL=app.js.map