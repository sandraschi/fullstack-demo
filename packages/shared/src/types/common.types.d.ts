export interface ServiceHealth {
    serviceId: string;
    status: 'healthy' | 'degraded' | 'down' | 'unknown';
    uptime: number;
    lastCheck: string;
    version: string;
    environment: string;
    metrics: ServiceMetrics;
}
export interface ServiceMetrics {
    responseTime: {
        p50: number;
        p95: number;
        p99: number;
    };
    requestRate: number;
    errorRate: number;
    activeConnections: number;
    memoryUsage: number;
    cpuUsage: number;
}
export interface TimeSeriesData {
    timestamp: string;
    value: number;
    label?: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    timestamp: string;
    requestId: string;
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface HealthCheckResponse {
    status: 'healthy' | 'degraded' | 'down';
    services: ServiceHealth[];
    timestamp: string;
    uptime: number;
}
export interface LLMProvider {
    name: string;
    type: 'local' | 'cloud';
    endpoint: string;
    apiKey?: string;
    model: string;
    maxTokens: number;
    temperature: number;
}
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    metadata?: Record<string, any>;
}
export interface ChatRequest {
    messages: ChatMessage[];
    character?: string;
    provider?: string;
    maxTokens?: number;
    temperature?: number;
}
export interface ChatResponse {
    message: ChatMessage;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    provider: string;
    model: string;
    finishReason: string;
}
export interface ImageGenerationRequest {
    prompt: string;
    negativePrompt?: string;
    width?: number;
    height?: number;
    steps?: number;
    guidance?: number;
    seed?: number;
    style?: string;
}
export interface ImageGenerationResponse {
    imageUrl: string;
    metadata: {
        prompt: string;
        negativePrompt?: string;
        width: number;
        height: number;
        steps: number;
        guidance: number;
        seed: number;
        style?: string;
        model: string;
        generationTime: number;
    };
}
export interface TTSRequest {
    text: string;
    voice?: string;
    language?: string;
    speed?: number;
    pitch?: number;
}
export interface TTSResponse {
    audioUrl: string;
    metadata: {
        text: string;
        voice: string;
        language: string;
        duration: number;
        sampleRate: number;
    };
}
export interface STTRequest {
    audioUrl: string;
    language?: string;
    format?: string;
}
export interface STTResponse {
    text: string;
    metadata: {
        language: string;
        confidence: number;
        duration: number;
        words: Array<{
            word: string;
            start: number;
            end: number;
            confidence: number;
        }>;
    };
}
export declare class AppError extends Error {
    code: string;
    statusCode: number;
    details?: any | undefined;
    constructor(code: string, message: string, statusCode?: number, details?: any | undefined);
}
export declare class ValidationError extends AppError {
    constructor(message: string, details?: any);
}
export declare class NotFoundError extends AppError {
    constructor(resource: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class RateLimitError extends AppError {
    constructor(message?: string);
}
//# sourceMappingURL=common.types.d.ts.map