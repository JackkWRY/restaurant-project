import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import jwt from 'jsonwebtoken';

import authRoutes from './routes/authRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import logger from './config/logger.js';
import { requestLogger } from './middlewares/requestLogger.js';
import config, { PORT, CORS_CONFIG, RATE_LIMIT_CONFIG, SOCKET_CONFIG, JWT_CONFIG } from './config/index.js';

dotenv.config();

// Environment variables are validated automatically when importing from config/env.ts
// No need to call validateConfig() anymore

const app = express();
const httpServer = createServer(app);

// Setup Socket.io
const io = new Server(httpServer, SOCKET_CONFIG);

// Socket.IO Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    logger.warn('Socket connection attempt without token', { socketId: socket.id });
    return next(new Error('Authentication error: No token provided'));
  }
  
  try {
    const secret = JWT_CONFIG.accessTokenSecret;
    if (!secret) {
      logger.error('JWT_SECRET not configured for Socket.IO');
      return next(new Error('Server configuration error'));
    }
    
    const decoded = jwt.verify(token, secret) as { userId: number; role: string };
    socket.data.user = decoded;
    
    logger.debug('Socket authenticated', { 
      socketId: socket.id, 
      userId: decoded.userId, 
      role: decoded.role 
    });
    
    next();
  } catch (err) {
    logger.warn('Socket authentication failed', { 
      socketId: socket.id, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    });
    return next(new Error('Authentication error: Invalid token'));
  }
});

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

// Response Compression (reduces response size by 60-70%)
app.use(compression());

// Setup Express CORS
app.use(cors({
  origin: CORS_CONFIG.origins,
  credentials: CORS_CONFIG.credentials
}));

app.use(express.json());
app.use(requestLogger); // Add request logging
app.set('io', io);

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  const user = socket.data.user;
  
  logger.info('User connected via Socket.IO', { 
    socketId: socket.id, 
    userId: user.userId, 
    role: user.role 
  });
  
  // Join role-based rooms for targeted broadcasting
  if (user.role === 'ADMIN' || user.role === 'STAFF') {
    socket.join('staff-room');
    logger.debug('User joined staff-room', { userId: user.userId });
  }
  
  if (user.role === 'KITCHEN') {
    socket.join('kitchen-room');
    logger.debug('User joined kitchen-room', { userId: user.userId });
  }
  
  socket.on('disconnect', () => {
    logger.info('User disconnected', { 
      socketId: socket.id, 
      userId: user.userId, 
      role: user.role 
    });
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