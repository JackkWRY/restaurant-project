import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../prisma.js';
import { loginSchema } from '../schemas/authSchema.js';

type LoginInput = z.infer<typeof loginSchema>;

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body as LoginInput;

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not defined in environment variables');
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      secret,
      { expiresIn: '1d' }
    );

    res.json({
      status: 'success',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: 'Login failed' });
  }
};