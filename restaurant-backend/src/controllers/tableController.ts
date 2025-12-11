import type { Request, Response } from 'express';
import prisma from '../prisma.js';

// 1. สร้างโต๊ะใหม่
export const createTable = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    
    // สร้าง QR Code อัตโนมัติจาก URL (สมมติว่า Frontend รันที่ Port 3001)
    // เดี๋ยวเราจะได้ ID จริงหลังจาก create เสร็จ แล้วค่อย update หรือใช้ ID นั้นเลยก็ได้
    // ในที่นี้เราสร้างไปก่อน แล้วค่อยเอา ID มาประกอบลิงก์ทีหลังได้ หรือจะใส่เป็น Dummy ไว้ก่อน
    const newTable = await prisma.table.create({
      data: {
        name,
        qrCode: `http://localhost:3001/?tableId=` // เดี๋ยว Frontend ไปเติมเลขเอง
      }
    });

    // อัปเดต QR Code ให้สมบูรณ์ (Optional)
    const updatedTable = await prisma.table.update({
      where: { id: newTable.id },
      data: { qrCode: `http://localhost:3001/?tableId=${newTable.id}` }
    });

    res.status(201).json({ status: 'success', data: updatedTable });
  } catch (error) {
    console.error("Create Table Error:", error);
    res.status(500).json({ error: 'Failed to create table' });
  }
};

// 2. แก้ไขชื่อโต๊ะ
export const updateTable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedTable = await prisma.table.update({
      where: { id: Number(id) },
      data: { name }
    });

    res.json({ status: 'success', data: updatedTable });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update table' });
  }
};

// 3. ลบโต๊ะ
export const deleteTable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // เช็คก่อนว่ามีออเดอร์ค้างไหม (เพื่อความปลอดภัย)
    const table = await prisma.table.findUnique({
      where: { id: Number(id) },
      include: { orders: true }
    });

    if (table && table.orders.length > 0) {
      // ถ้ามีออเดอร์ (แม้จะจบไปแล้ว) อาจจะลบไม่ได้ถ้าติด Relation
      // ในที่นี้เราจะลบออเดอร์ทั้งหมดของโต๊ะนี้ทิ้งก่อน (Hard Reset) หรือแจ้งเตือน
      // เพื่อความง่ายใน Demo: ลบออเดอร์ที่เกี่ยวข้องทิ้งให้หมดก่อน
      await prisma.orderItem.deleteMany({
        where: { order: { tableId: Number(id) } }
      });
      await prisma.order.deleteMany({
        where: { tableId: Number(id) }
      });
    }

    await prisma.table.delete({
      where: { id: Number(id) }
    });

    res.json({ status: 'success', message: 'Table deleted' });
  } catch (error) {
    console.error("Delete Table Error:", error);
    res.status(500).json({ error: 'Failed to delete table' });
  }
};

// 4. เปิด-ปิดโต๊ะ
export const toggleAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body; // รับค่า true/false จากหน้าบ้าน

    const updatedTable = await prisma.table.update({
      where: { id: Number(id) },
      data: { isAvailable }
    });

    res.json({ status: 'success', data: updatedTable });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update availability' });
  }
};

// 5. ดึงข้อมูลโต๊ะเดี่ยว (เพื่อให้ลูกค้าเช็คสถานะตอนสแกน)
export const getTableById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const table = await prisma.table.findUnique({ where: { id: Number(id) } });

    if (!table) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }
    
    res.json({ status: 'success', data: table });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching table' });
  }
};