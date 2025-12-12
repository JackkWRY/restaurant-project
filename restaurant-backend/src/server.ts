import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'node:http'; // 1. นำเข้า http server
import { Server } from 'socket.io';       // 2. นำเข้า socket.io

import prisma from './prisma.js';
import settingRoutes from './routes/settingRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// 3. สร้าง HTTP Server ครอบ Express app ไว้
const httpServer = createServer(app);

// 4. ตั้งค่า Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "*", // อนุญาตให้ Frontend (Port 3001) เชื่อมต่อเข้ามาได้
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// 5. ฝากตัวแปร io ไว้ใน app เพื่อให้ Controller เรียกใช้ได้
app.set('io', io);

// Log เมื่อมีคนเชื่อมต่อ Socket เข้ามา (เช่น หน้าจอครัวเปิดอยู่)
io.on('connection', (socket) => {
  console.log('🔌 A client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('❌ A client disconnected:', socket.id);
  });
});

// --- Register Routes ---
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

// 6. เปลี่ยนจาก app.listen เป็น httpServer.listen
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});