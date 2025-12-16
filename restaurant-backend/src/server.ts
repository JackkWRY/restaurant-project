import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

import prisma from './prisma.js';
import authRoutes from './routes/authRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
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

// Home Route
app.get('/', (req: Request, res: Response) => {
  res.send('<h1>Restaurant API is running! (TypeScript + Socket.io 🚀)</h1>');
});

// Test DB Route
app.get('/api/tables', async (req: Request, res: Response) => {
  try {
    const tables = await prisma.table.findMany();
    res.json({ status: 'success', data: tables });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});