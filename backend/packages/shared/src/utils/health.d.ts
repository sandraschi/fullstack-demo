import { ServiceHealth, ServiceMetrics } from '../types/common.types';
export interface HealthCheckConfig {
    serviceId: string;
    version: string;
    environment: string;
    dependencies?: Array<{
        name: string;
        check: () => Promise<boolean>;
        timeout?: number;
    }>;
}
export declare class HealthMonitor {
    private config;
    private startTime;
    private metrics;
    private requestCount;
    private errorCount;
    private responseTimes;
    constructor(config: HealthCheckConfig);
    private initializeMetrics;
    recordRequest(responseTime: number, isError?: boolean): void;
    private updateMetrics;
    private percentile;
    getHealth(): Promise<ServiceHealth>;
    private determineStatus;
    getMetrics(): ServiceMetrics;
    reset(): void;
}
export declare function createHealthMonitor(config: HealthCheckConfig): HealthMonitor;
export declare function createHealthEndpoint(healthMonitor: HealthMonitor): (req: any, res: any) => Promise<void>;
//# sourceMappingURL=health.d.ts.map