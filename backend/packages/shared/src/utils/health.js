"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthMonitor = void 0;
exports.createHealthMonitor = createHealthMonitor;
exports.createHealthEndpoint = createHealthEndpoint;
class HealthMonitor {
    config;
    startTime;
    metrics;
    requestCount = 0;
    errorCount = 0;
    responseTimes = [];
    constructor(config) {
        this.config = config;
        this.startTime = new Date();
        this.metrics = this.initializeMetrics();
    }
    initializeMetrics() {
        return {
            responseTime: {
                p50: 0,
                p95: 0,
                p99: 0,
            },
            requestRate: 0,
            errorRate: 0,
            activeConnections: 0,
            memoryUsage: 0,
            cpuUsage: 0,
        };
    }
    recordRequest(responseTime, isError = false) {
        this.requestCount++;
        if (isError) {
            this.errorCount++;
        }
        this.responseTimes.push(responseTime);
        if (this.responseTimes.length > 1000) {
            this.responseTimes = this.responseTimes.slice(-1000);
        }
        this.updateMetrics();
    }
    updateMetrics() {
        if (this.responseTimes.length === 0)
            return;
        const sortedTimes = [...this.responseTimes].sort((a, b) => a - b);
        const count = sortedTimes.length;
        this.metrics.responseTime.p50 = this.percentile(sortedTimes, 0.5);
        this.metrics.responseTime.p95 = this.percentile(sortedTimes, 0.95);
        this.metrics.responseTime.p99 = this.percentile(sortedTimes, 0.99);
        const uptimeMinutes = (Date.now() - this.startTime.getTime()) / (1000 * 60);
        this.metrics.requestRate = Math.round(this.requestCount / uptimeMinutes);
        this.metrics.errorRate = this.requestCount > 0 ? this.errorCount / this.requestCount : 0;
        this.metrics.memoryUsage = process.memoryUsage().heapUsed / process.memoryUsage().heapTotal;
        this.metrics.cpuUsage = process.cpuUsage().user / 1000000;
    }
    percentile(sortedArray, p) {
        const index = Math.ceil(sortedArray.length * p) - 1;
        return sortedArray[Math.max(0, index)] || 0;
    }
    async getHealth() {
        const status = await this.determineStatus();
        return {
            serviceId: this.config.serviceId,
            status,
            uptime: Date.now() - this.startTime.getTime(),
            lastCheck: new Date().toISOString(),
            version: this.config.version,
            environment: this.config.environment,
            metrics: { ...this.metrics },
        };
    }
    async determineStatus() {
        try {
            if (this.config.dependencies && this.config.dependencies.length > 0) {
                const dependencyChecks = await Promise.allSettled(this.config.dependencies.map(async (dep) => {
                    const timeout = dep.timeout || 5000;
                    return Promise.race([
                        dep.check(),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout))
                    ]);
                }));
                const failedDependencies = dependencyChecks.filter((result) => result.status === 'rejected').length;
                if (failedDependencies === this.config.dependencies.length) {
                    return 'down';
                }
                else if (failedDependencies > 0) {
                    return 'degraded';
                }
            }
            if (this.metrics.errorRate > 0.1) {
                return 'degraded';
            }
            if (this.metrics.responseTime.p95 > 5000) {
                return 'degraded';
            }
            return 'healthy';
        }
        catch (error) {
            return 'unknown';
        }
    }
    getMetrics() {
        return { ...this.metrics };
    }
    reset() {
        this.requestCount = 0;
        this.errorCount = 0;
        this.responseTimes = [];
        this.startTime = new Date();
        this.metrics = this.initializeMetrics();
    }
}
exports.HealthMonitor = HealthMonitor;
function createHealthMonitor(config) {
    return new HealthMonitor(config);
}
function createHealthEndpoint(healthMonitor) {
    return async (req, res) => {
        try {
            const health = await healthMonitor.getHealth();
            res.json(health);
        }
        catch (error) {
            res.status(500).json({
                serviceId: healthMonitor['config'].serviceId,
                status: 'unknown',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            });
        }
    };
}
//# sourceMappingURL=health.js.map