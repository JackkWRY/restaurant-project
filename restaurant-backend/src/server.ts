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
import staffRoutes from './routes/staffRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import billRoutes from './routes/billRoutes.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const httpServer = createServer(app);

const allowedOrigins = [CLIENT_URL, 'http://localhost:3000'];

// Setup Socket.io
const io = new Server(httpServer, {
  cors: {
    // origin: CLIENT_URL,
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Setup Express CORS
app.use(cors({
  // origin: CLIENT_URL,
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.set('io', io);

io.on('connection', (socket) => {
  // console.log('🔌 Client connected:', socket.id); // ปิด Log เพื่อความสะอาด
  socket.on('disconnect', () => {
    // console.log('❌ Client disconnected');
  });
});

// --- Register Routes ---
app.use('/api', authRoutes);
app.use('/api', settingRoutes);
app.use('/api', menuRoutes);
app.use('/api', orderRoutes);
app.use('/api', staffRoutes);
app.use('/api', tableRoutes);
app.use('/api', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', billRoutes);

// Health Check
app.get('/', (req: Request, res: Response) => {
  // res.send(`<h1>Restaurant API Running! 🚀 (Allowing: ${CLIENT_URL})</h1>`);
  res.send(`<h1>Restaurant API Running! 🚀</h1><p>Allowed Origins: ${allowedOrigins.join(', ')}</p>`);
});

// Start Server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Backend running on port ${PORT}`);
  // console.log(`🔒 Accepting connections from: ${CLIENT_URL}`);
  console.log(`🔒 Allowed Origins:`, allowedOrigins);
});