export declare enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3
}
export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    service: string;
    message: string;
    data?: any;
    requestId?: string;
    userId?: string;
}
export declare class Logger {
    private static instance;
    private logLevel;
    private serviceName;
    private constructor();
    static getInstance(serviceName: string, logLevel?: LogLevel): Logger;
    private shouldLog;
    private formatLog;
    private output;
    error(message: string, data?: any, requestId?: string, userId?: string): void;
    warn(message: string, data?: any, requestId?: string, userId?: string): void;
    info(message: string, data?: any, requestId?: string, userId?: string): void;
    debug(message: string, data?: any, requestId?: string, userId?: string): void;
    setLogLevel(level: LogLevel): void;
}
export declare function createLogger(serviceName: string, logLevel?: LogLevel): Logger;
export declare function logRequest(serviceName: string): (req: any, res: any, next: any) => void;
//# sourceMappingURL=logger.d.ts.map