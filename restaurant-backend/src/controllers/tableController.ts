import type { Request, Response } from 'express';
import prisma from '../prisma.js';

// 1. สร้างโต๊ะใหม่
export const createTable = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    
    const newTable = await prisma.table.create({
      data: {
        name,
        qrCode: `http://localhost:3001/?tableId=`
      }
    });

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

    const table = await prisma.table.findUnique({
      where: { id: Number(id) },
      include: { orders: true }
    });

    if (table && table.orders.length > 0) {
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
    const { isAvailable } = req.body;

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

// 6. ลูกค้ากดเรียกพนักงาน (หรือพนักงานกดปิดเสียงเรียก)
export const updateCallStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isCalling } = req.body;

    const updatedTable = await prisma.table.update({
      where: { id: Number(id) },
      data: { isCallingStaff: isCalling },
      include: {
        orders: {
          where: { status: { not: 'COMPLETED' } }
        }
      }
    });

    const payload = {
      ...updatedTable,
      isOccupied: updatedTable.orders.length > 0
    }

    const io = req.app.get('io');
    io.emit('table_updated', payload); 

    res.json({ status: 'success', data: payload });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update call staff status' });
  }
};

// 7. ดึงประวัติการสั่งอาหาร (สำหรับลูกค้าดูเอง)
export const getCustomerOrders = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const orders = await prisma.order.findMany({
      where: {
        tableId: Number(id),
        status: { not: 'COMPLETED' } 
      },
      include: {
        items: {
          include: { menu: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const items = orders.flatMap(order => 
      order.items.map(item => ({
        id: item.id,
        menuName: item.menu.nameTH,
        price: Number(item.menu.price),
        quantity: item.quantity,
        status: order.status,
        total: Number(item.menu.price) * item.quantity
      }))
    );

    res.json({ status: 'success', data: items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch customer orders' });
  }
};