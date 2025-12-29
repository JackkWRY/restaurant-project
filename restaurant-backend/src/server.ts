import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import billRoutes from './routes/billRoutes.js';
import logger from './config/logger.js';
import { requestLogger } from './middlewares/requestLogger.js';
import config, { PORT, CORS_CONFIG, RATE_LIMIT_CONFIG, SOCKET_CONFIG, validateConfig } from './config/index.js';

dotenv.config();

// Validate required environment variables
validateConfig();

const app = express();
const httpServer = createServer(app);

// Setup Socket.io
const io = new Server(httpServer, SOCKET_CONFIG);

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.windowMs,
  max: RATE_LIMIT_CONFIG.maxRequests,
  message: RATE_LIMIT_CONFIG.message
});
app.use(limiter);

// Setup Express CORS
app.use(cors({
  origin: CORS_CONFIG.origins,
  credentials: CORS_CONFIG.credentials
}));

app.use(express.json());
app.use(requestLogger); // Add request logging
app.set('io', io);

io.on('connection', (socket) => {
  logger.debug('Client connected', { socketId: socket.id });
  socket.on('disconnect', () => {
    logger.debug('Client disconnected', { socketId: socket.id });
  });
});

// --- Register Routes ---
app.use('/api', authRoutes);
app.use('/api', settingRoutes);
app.use('/api', menuRoutes);
app.use('/api', orderRoutes);
app.use('/api', tableRoutes);
app.use('/api', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', billRoutes);

// Health Check
app.get('/', (req: Request, res: Response) => {
  res.send(`<h1>Restaurant API Running! 🚀</h1><p>Allowed Origins: ${CORS_CONFIG.origins.join(', ')}</p>`);
});

// Error Handler (must be last!)
import { errorHandler } from './middlewares/errorHandler.js';
app.use(errorHandler);

// Start Server
httpServer.listen(PORT, '0.0.0.0', () => {
  logger.info(`Backend running on port ${PORT}`, { 
    port: PORT, 
    allowedOrigins: CORS_CONFIG.origins,
    environment: config.env
  });
});