import express from 'express';
import cors from 'cors';
import { logger } from '../../shared/src/utils/logger';
import { healthCheck } from '../../shared/src/utils/health';
import ttsRoutes from './routes/tts';

const app = express();
const PORT = process.env.PORT || 9200;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', healthCheck);

// Routes
app.use('/api/tts', ttsRoutes);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});

export default app;
