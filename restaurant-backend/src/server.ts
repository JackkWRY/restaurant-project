import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import prisma from './prisma.js';
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
const PORT = Number(process.env.PORT) || 3000;

const httpServer = createServer(app);

const allowedOrigins = [
  'http://localhost:3001',
  process.env.CLIENT_URL || ''
];

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"]
  }
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

app.set('io', io);

io.on('connection', (socket) => {
  console.log('🔌 A client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('❌ A client disconnected:', socket.id);
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

// Home Route
app.get('/', (req: Request, res: Response) => {
  res.send('<h1>Restaurant API is running! (TypeScript + Socket.io 🚀) [Secured]</h1>');
});

// Start Server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});