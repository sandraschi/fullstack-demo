"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = void 0;
const express_1 = require("express");
const logger_1 = require("@shared/utils/logger");
const router = (0, express_1.Router)();
exports.healthRoutes = router;
const logger = (0, logger_1.createLogger)('api-gateway');
const mockServices = [
    {
        serviceId: 'chat-service',
        status: 'healthy',
        uptime: 99.97,
        lastCheck: new Date().toISOString(),
        version: '1.0.0',
        environment: 'development',
        metrics: {
            responseTime: { p50: 150, p95: 300, p99: 500 },
            requestRate: 45,
            errorRate: 0.01,
            activeConnections: 12,
            memoryUsage: 0.65,
            cpuUsage: 0.25,
        },
    },
    {
        serviceId: 'image-service',
        status: 'healthy',
        uptime: 99.95,
        lastCheck: new Date().toISOString(),
        version: '1.0.0',
        environment: 'development',
        metrics: {
            responseTime: { p50: 2000, p95: 5000, p99: 8000 },
            requestRate: 8,
            errorRate: 0.02,
            activeConnections: 3,
            memoryUsage: 0.85,
            cpuUsage: 0.70,
        },
    },
    {
        serviceId: 'tts-service',
        status: 'degraded',
        uptime: 99.89,
        lastCheck: new Date().toISOString(),
        version: '1.0.0',
        environment: 'development',
        metrics: {
            responseTime: { p50: 800, p95: 2000, p99: 4000 },
            requestRate: 15,
            errorRate: 0.05,
            activeConnections: 5,
            memoryUsage: 0.45,
            cpuUsage: 0.30,
        },
    },
];
router.get('/', async (req, res) => {
    try {
        const requestId = req.requestId;
        logger.info('Health check requested', {}, requestId);
        const healthyServices = mockServices.filter(s => s.status === 'healthy').length;
        const totalServices = mockServices.length;
        const overallStatus = healthyServices === totalServices ? 'healthy' :
            healthyServices > 0 ? 'degraded' : 'down';
        const response = {
            success: true,
            data: {
                status: overallStatus,
                services: mockServices,
                timestamp: new Date().toISOString(),
                uptime: process.uptime() * 1000,
            },
            timestamp: new Date().toISOString(),
            requestId,
        };
        res.json(response);
    }
    catch (error) {
        logger.error('Health check failed', { error: error.message }, req.requestId);
        res.status(500).json({
            success: false,
            error: {
                code: 'HEALTH_CHECK_FAILED',
                message: 'Failed to retrieve system health',
            },
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
        });
    }
});
router.get('/:serviceId', async (req, res) => {
    try {
        const { serviceId } = req.params;
        const requestId = req.requestId;
        logger.info('Service health check requested', { serviceId }, requestId);
        const service = mockServices.find(s => s.serviceId === serviceId);
        if (!service) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'SERVICE_NOT_FOUND',
                    message: `Service ${serviceId} not found`,
                },
                timestamp: new Date().toISOString(),
                requestId,
            });
            return;
        }
        const response = {
            success: true,
            data: service,
            timestamp: new Date().toISOString(),
            requestId,
        };
        res.json(response);
    }
    catch (error) {
        logger.error('Service health check failed', {
            serviceId: req.params.serviceId,
            error: error.message
        }, req.requestId);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVICE_HEALTH_CHECK_FAILED',
                message: 'Failed to retrieve service health',
            },
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
        });
    }
});
router.get('/metrics/all', async (req, res) => {
    try {
        const requestId = req.requestId;
        logger.info('All metrics requested', {}, requestId);
        const metrics = mockServices.map(service => ({
            serviceId: service.serviceId,
            metrics: service.metrics,
            timestamp: new Date().toISOString(),
        }));
        const response = {
            success: true,
            data: metrics,
            timestamp: new Date().toISOString(),
            requestId,
        };
        res.json(response);
    }
    catch (error) {
        logger.error('Metrics retrieval failed', { error: error.message }, req.requestId);
        res.status(500).json({
            success: false,
            error: {
                code: 'METRICS_RETRIEVAL_FAILED',
                message: 'Failed to retrieve metrics',
            },
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
        });
    }
});
router.get('/:serviceId/metrics', async (req, res) => {
    try {
        const { serviceId } = req.params;
        const requestId = req.requestId;
        logger.info('Service metrics requested', { serviceId }, requestId);
        const service = mockServices.find(s => s.serviceId === serviceId);
        if (!service) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'SERVICE_NOT_FOUND',
                    message: `Service ${serviceId} not found`,
                },
                timestamp: new Date().toISOString(),
                requestId,
            });
            return;
        }
        const response = {
            success: true,
            data: {
                serviceId: service.serviceId,
                metrics: service.metrics,
                timestamp: new Date().toISOString(),
            },
            timestamp: new Date().toISOString(),
            requestId,
        };
        res.json(response);
    }
    catch (error) {
        logger.error('Service metrics retrieval failed', {
            serviceId: req.params.serviceId,
            error: error.message
        }, req.requestId);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVICE_METRICS_RETRIEVAL_FAILED',
                message: 'Failed to retrieve service metrics',
            },
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
        });
    }
});
//# sourceMappingURL=health.js.map