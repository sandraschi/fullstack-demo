import { Request, Response, NextFunction } from 'express';
interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    keyGenerator?: (req: Request) => string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
}
export declare function rateLimiter(config?: Partial<RateLimitConfig>): (req: Request, res: Response, next: NextFunction) => void;
export declare const chatRateLimiter: (req: Request, res: Response, next: NextFunction) => void;
export declare const imageRateLimiter: (req: Request, res: Response, next: NextFunction) => void;
export declare const ttsRateLimiter: (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=rateLimiter.d.ts.map