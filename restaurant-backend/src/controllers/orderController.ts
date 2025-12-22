import type { Request, Response } from 'express';
import prisma from '../prisma.js';
import { OrderStatus, BillStatus } from '../config/enums.js';

export const createOrder = async (req: Request, res: Response) => {
    try {
    const { tableId, items } = req.body;

    if (!tableId || !items || items.length === 0) {
      res.status(400).json({ error: 'Missing tableId or items' });
      return;
    }

    const table = await prisma.table.findUnique({ where: { id: Number(tableId) } });
    if (!table) { res.status(404).json({ error: 'Table not found' }); return; }
    if (!table.isAvailable) { res.status(400).json({ error: 'Table closed' }); return; }

    let currentOrderTotal = 0;
    for (const item of items) {
      const menu = await prisma.menu.findUnique({ where: { id: Number(item.menuId) } });
      if (menu) currentOrderTotal += Number(menu.price) * item.quantity;
    }

    let activeBill = await prisma.bill.findFirst({
        where: {
            tableId: Number(tableId),
            status: BillStatus.OPEN
        }
    });

    if (!activeBill) {
        activeBill = await prisma.bill.create({
            data: {
                tableId: Number(tableId),
                status: BillStatus.OPEN,
                totalPrice: 0
            }
        });
        console.log(`✨ Created new Bill ID: ${activeBill.id} for Table ${tableId}`);
    } else {
        console.log(`🔗 Linking to existing Bill ID: ${activeBill.id}`);
    }

    await prisma.bill.update({
        where: { id: activeBill.id },
        data: {
            totalPrice: { increment: currentOrderTotal }
        }
    });

    const newOrder = await prisma.order.create({
      data: {
        tableId: Number(tableId),
        totalPrice: currentOrderTotal,
        status: OrderStatus.PENDING,
        billId: activeBill.id,
        items: {
          create: items.map((item: any) => ({
            menuId: Number(item.menuId), 
            quantity: item.quantity,
            note: item.note || '',
            status: OrderStatus.PENDING 
          })),
        },
      },
      include: { items: { include: { menu: true } }, table: true },
    });

    await prisma.table.update({
        where: { id: Number(tableId) },
        data: { isOccupied: true }
    });

    const io = req.app.get('io');
    io.emit('new_order', newOrder);

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
      data: { 
        status: status,
        items: {
          updateMany: {
            where: { status: { not: OrderStatus.CANCELLED } },
            data: { status: status }
          }
        }
      },
      include: {
        table: true,
        items: { 
          where: { status: { not: OrderStatus.CANCELLED } },
          include: { menu: true } 
        }
      }
    });

    const io = req.app.get('io');
    io.emit('order_status_updated', updatedOrder);
    
    console.log(`✅ Order #${id} updated to ${status} (Synced items)`);
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
        status: { in: [OrderStatus.PENDING, OrderStatus.COOKING, OrderStatus.READY] } 
      },
      include: {
        items: { 
          where: { status: { not: OrderStatus.CANCELLED } },
          include: { menu: true } 
        },
        table: true
      },
      orderBy: { createdAt: 'asc' }
    });

    const validOrders = orders.filter(order => order.items.length > 0);

    res.json({ status: 'success', data: validOrders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch active orders' });
  }
};

export const updateOrderItemStatus = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body;

    const updatedItem = await prisma.orderItem.update({
      where: { id: Number(itemId) },
      data: { status },
      include: {
        menu: true,
        order: {
            include: { table: true }
        }
      }
    });

    const io = req.app.get('io');
    
    const payload = {
        id: updatedItem.id,
        orderId: updatedItem.orderId,
        status: updatedItem.status,
        menuName: updatedItem.menu.nameTH,
        tableName: updatedItem.order.table.name,
        quantity: updatedItem.quantity,
        note: updatedItem.note,
        createdAt: updatedItem.order.createdAt
    };

    io.emit('item_status_updated', payload);

    res.json({ status: 'success', data: updatedItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update item status' });
  }
};