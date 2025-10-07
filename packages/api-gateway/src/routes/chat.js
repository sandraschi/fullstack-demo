"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRoutes = void 0;
const express_1 = require("express");
const logger_1 = require("@shared/utils/logger");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
exports.chatRoutes = router;
const logger = (0, logger_1.createLogger)('api-gateway');
const mockChatService = {
    async generateResponse(request) {
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        const messages = request.messages;
        const lastMessage = messages[messages.length - 1];
        const character = request.character || 'assistant';
        let response = '';
        switch (character) {
            case 'scientist':
                response = `As a scientist, I find your question about "${lastMessage.content}" fascinating. Let me analyze this from a research perspective...`;
                break;
            case 'philosopher':
                response = `From a philosophical standpoint, "${lastMessage.content}" raises profound questions about existence and meaning...`;
                break;
            case 'engineer':
                response = `From an engineering perspective, "${lastMessage.content}" can be approached systematically. Here's how I would solve this...`;
                break;
            case 'creative':
                response = `What an inspiring question! "${lastMessage.content}" sparks my imagination. Let me paint you a picture...`;
                break;
            default:
                response = `I understand you're asking about "${lastMessage.content}". Let me help you with that.`;
        }
        return {
            message: {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                role: 'assistant',
                content: response,
                timestamp: new Date().toISOString(),
                metadata: {
                    character,
                    model: 'mock-llm',
                    provider: 'local',
                },
            },
            usage: {
                promptTokens: Math.floor(lastMessage.content.length / 4),
                completionTokens: Math.floor(response.length / 4),
                totalTokens: Math.floor((lastMessage.content.length + response.length) / 4),
            },
            provider: 'mock',
            model: 'mock-llm-v1',
            finishReason: 'stop',
        };
    }
};
router.post('/', rateLimiter_1.chatRateLimiter, async (req, res) => {
    try {
        const requestId = req.requestId;
        const chatRequest = req.body;
        logger.info('Chat request received', {
            character: chatRequest.character,
            messageCount: chatRequest.messages.length,
            provider: chatRequest.provider,
        }, requestId);
        if (!chatRequest.messages || chatRequest.messages.length === 0) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Messages array is required and cannot be empty',
                },
                timestamp: new Date().toISOString(),
                requestId,
            });
            return;
        }
        const lastMessage = chatRequest.messages[chatRequest.messages.length - 1];
        if (!lastMessage.content || lastMessage.content.trim().length === 0) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Last message content cannot be empty',
                },
                timestamp: new Date().toISOString(),
                requestId,
            });
            return;
        }
        const startTime = Date.now();
        const chatResponse = await mockChatService.generateResponse(chatRequest);
        const processingTime = Date.now() - startTime;
        logger.info('Chat response generated', {
            character: chatRequest.character,
            processingTime: `${processingTime}ms`,
            tokens: chatResponse.usage.totalTokens,
        }, requestId);
        const response = {
            success: true,
            data: chatResponse,
            timestamp: new Date().toISOString(),
            requestId,
        };
        res.json(response);
    }
    catch (error) {
        logger.error('Chat request failed', {
            error: error.message,
            stack: error.stack,
        }, req.requestId);
        res.status(500).json({
            success: false,
            error: {
                code: 'CHAT_SERVICE_ERROR',
                message: 'Failed to generate chat response',
            },
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
        });
    }
});
router.get('/characters', async (req, res) => {
    try {
        const requestId = req.requestId;
        logger.info('Characters list requested', {}, requestId);
        const characters = [
            {
                id: 'assistant',
                name: 'Assistant',
                description: 'A helpful and friendly AI assistant',
                personality: 'Helpful, informative, and approachable',
                specialties: ['General questions', 'Problem solving', 'Information'],
            },
            {
                id: 'scientist',
                name: 'Dr. Research',
                description: 'A brilliant scientist with expertise in multiple fields',
                personality: 'Analytical, methodical, and evidence-based',
                specialties: ['Scientific research', 'Data analysis', 'Hypothesis testing'],
            },
            {
                id: 'philosopher',
                name: 'Sage Wisdom',
                description: 'A wise philosopher who contemplates life\'s deepest questions',
                personality: 'Thoughtful, contemplative, and insightful',
                specialties: ['Ethics', 'Existential questions', 'Critical thinking'],
            },
            {
                id: 'engineer',
                name: 'Tech Builder',
                description: 'A practical engineer who loves solving technical problems',
                personality: 'Logical, practical, and solution-oriented',
                specialties: ['Technical problems', 'System design', 'Optimization'],
            },
            {
                id: 'creative',
                name: 'Artistic Muse',
                description: 'A creative spirit who inspires artistic expression',
                personality: 'Imaginative, expressive, and inspiring',
                specialties: ['Creative writing', 'Artistic projects', 'Brainstorming'],
            },
        ];
        const response = {
            success: true,
            data: characters,
            timestamp: new Date().toISOString(),
            requestId,
        };
        res.json(response);
    }
    catch (error) {
        logger.error('Characters list failed', { error: error.message }, req.requestId);
        res.status(500).json({
            success: false,
            error: {
                code: 'CHARACTERS_LIST_ERROR',
                message: 'Failed to retrieve characters list',
            },
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
        });
    }
});
router.get('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const requestId = req.requestId;
        logger.info('Chat history requested', { userId }, requestId);
        const history = [
            {
                id: 'chat_1',
                title: 'Discussion about AI',
                character: 'scientist',
                messages: [
                    {
                        id: 'msg_1',
                        role: 'user',
                        content: 'What is artificial intelligence?',
                        timestamp: new Date(Date.now() - 3600000).toISOString(),
                    },
                    {
                        id: 'msg_2',
                        role: 'assistant',
                        content: 'Artificial intelligence is a branch of computer science...',
                        timestamp: new Date(Date.now() - 3590000).toISOString(),
                    },
                ],
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                updatedAt: new Date(Date.now() - 3590000).toISOString(),
            },
        ];
        const response = {
            success: true,
            data: history,
            timestamp: new Date().toISOString(),
            requestId,
        };
        res.json(response);
    }
    catch (error) {
        logger.error('Chat history failed', {
            userId: req.params.userId,
            error: error.message
        }, req.requestId);
        res.status(500).json({
            success: false,
            error: {
                code: 'CHAT_HISTORY_ERROR',
                message: 'Failed to retrieve chat history',
            },
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
        });
    }
});
//# sourceMappingURL=chat.js.map