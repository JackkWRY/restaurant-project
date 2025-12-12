import type { Request, Response } from 'express';
import prisma from '../prisma.js';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { tableId, items } = req.body;

    // 1. Validate ข้อมูลพื้นฐาน
    if (!tableId || !items || items.length === 0) {
      res.status(400).json({ error: 'Missing tableId or items' });
      return;
    }

    // 2. เช็คสถานะโต๊ะ
    const table = await prisma.table.findUnique({
      where: { id: Number(tableId) }
    });

    if (!table) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    if (!table.isAvailable) {
      res.status(400).json({ error: 'This table is currently closed.' });
      return;
    }

    // 3. คำนวณราคา (re-calculate เพื่อความปลอดภัย)
    let totalPrice = 0;
    for (const item of items) {
      const menu = await prisma.menu.findUnique({ where: { id: Number(item.menuId) } });
      if (menu) {
        totalPrice += Number(menu.price) * item.quantity;
      }
    }

    // 4. สร้างออเดอร์
    const newOrder = await prisma.order.create({
      data: {
        tableId: Number(tableId),
        totalPrice: totalPrice,
        status: 'PENDING',
        items: {
          create: items.map((item: any) => ({
            menuId: Number(item.menuId), 
            quantity: item.quantity,
            note: item.note || '',
          })),
        },
      },
      include: {
        items: {
          include: { menu: true } 
        }, 
        table: true 
      },
    });

    // 5. Socket.io Emit
    const io = req.app.get('io');
    io.emit('new_order', newOrder);
    console.log(`📣 Emitted 'new_order' event for Order #${newOrder.id}`);

    res.status(201).json({ status: 'success', data: newOrder });

  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; 
    const { status } = req.body; 

    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: { status: status },
    });

    const io = req.app.get('io');
    io.emit('order_status_updated', updatedOrder);
    
    console.log(`✅ Order #${id} updated to ${status}`);
    res.json({ status: 'success', data: updatedOrder });

  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

export const getActiveOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['PENDING', 'COOKING'] }
      },
      include: {
        items: {
          include: { menu: true }
        },
        table: true
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ status: 'success', data: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch active orders' });
  }
};