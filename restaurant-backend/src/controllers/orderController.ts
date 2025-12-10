import type { Request, Response } from 'express';
import prisma from '../prisma.js';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { tableId, items } = req.body;

    if (!tableId || !items || items.length === 0) {
      res.status(400).json({ error: 'Missing tableId or items' });
      return;
    }

    let totalPrice = 0;
    for (const item of items) {
      const menu = await prisma.menu.findUnique({ where: { id: item.id } });
      if (menu) {
        totalPrice += Number(menu.price) * item.quantity;
      }
    }

    // สร้างออเดอร์
    const newOrder = await prisma.order.create({
      data: {
        tableId: Number(tableId),
        totalPrice: totalPrice,
        status: 'PENDING',
        items: {
          create: items.map((item: any) => ({
            menuId: item.id,
            quantity: item.quantity,
            note: item.note || '',
          })),
        },
      },
      include: {
        items: {
          include: { menu: true } // *สำคัญ: พ่วงชื่อเมนูมาด้วย เพื่อให้ครัวอ่านรู้เรื่อง
        }, 
        table: true // พ่วงชื่อโต๊ะมาด้วย
      },
    });

    // --- ส่วนที่เพิ่มมา (Socket.io Emit) ---
    // ดึงตัวแปร io ที่เราฝากไว้ใน server.ts
    const io = req.app.get('io');
    
    // ส่งสัญญาณชื่อ 'new_order' พร้อมข้อมูลออเดอร์ไปให้ทุกคน
    io.emit('new_order', newOrder);
    console.log(`📣 Emitted 'new_order' event for Order #${newOrder.id}`);
    // ------------------------------------

    res.status(201).json({ status: 'success', data: newOrder });

  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // รับ id จาก URL (เช่น /orders/5/status)
    const { status } = req.body; // รับสถานะใหม่จาก body

    // อัปเดตข้อมูลใน DB
    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: { status: status },
    });

    // ส่งสัญญาณบอกทุกคนว่าออเดอร์นี้เปลี่ยนสถานะแล้วนะ (Optional: เผื่อหน้าลูกค้าอยากรู้)
    const io = req.app.get('io');
    io.emit('order_status_updated', updatedOrder);
    
    console.log(`✅ Order #${id} updated to ${status}`);
    res.json({ status: 'success', data: updatedOrder });

  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};