import type { Request, Response } from 'express';
import prisma from '../prisma.js';
import { OrderStatus } from '../config/enums.js';

export const getTablesStatus = async (req: Request, res: Response) => {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { name: 'asc' },
      include: {
        orders: {
          where: {
            status: { not: OrderStatus.COMPLETED }
          },
          include: { 
            items: {
              include: { menu: true }
            }
          }
        }
      }
    });

    const tableData = tables.map(table => {
      const totalAmount = table.orders.reduce((orderSum, order) => {
        if (order.status === OrderStatus.CANCELLED) return orderSum;

        const itemsTotal = order.items.reduce((itemSum, item) => {
          if (item.status === OrderStatus.CANCELLED) return itemSum;
          return itemSum + (Number(item.menu.price) * item.quantity);
        }, 0);

        return orderSum + itemsTotal;
      }, 0);
      
      const readyCount = table.orders.reduce((count, order) => {
        const readyItemsInOrder = order.items.filter(item => item.status === OrderStatus.READY).length;
        return count + readyItemsInOrder;
      }, 0);

      return {
        id: table.id,
        name: table.name,
        isOccupied: table.isOccupied,
        totalAmount: totalAmount,
        activeOrders: table.orders.length,
        isAvailable: table.isAvailable,
        isCallingStaff: table.isCallingStaff,
        readyOrderCount: readyCount
      };
    });

    res.json({ status: 'success', data: tableData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch table status' });
  }
};

export const getTableDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const table = await prisma.table.findUnique({
      where: { id: Number(id) },
      include: {
        orders: {
          where: { status: { notIn: [OrderStatus.COMPLETED] } },
          include: { items: { include: { menu: true } } }
        }
      }
    });

    if (!table) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    const allItems = table.orders.flatMap(order => 
      order.items.map(item => ({
        id: item.id,
        orderId: order.id,
        menuName: item.menu.nameTH,
        price: Number(item.menu.price),
        quantity: item.quantity,
        total: Number(item.menu.price) * item.quantity,
        status: item.status,
        note: item.note
      }))
    );

    res.json({ status: 'success', data: { ...table, items: allItems } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch details' });
  }
};

export const cancelOrderItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;

    const updatedItem = await prisma.orderItem.update({
      where: { id: Number(itemId) },
      data: { status: OrderStatus.CANCELLED }
    });

    const parentOrder = await prisma.order.findUnique({
        where: { id: updatedItem.orderId },
        include: {
            table: true,
            items: {
                where: { status: { not: OrderStatus.CANCELLED } },
                include: { menu: true }
            }
        }
    });

    const io = req.app.get('io');

    if (parentOrder && parentOrder.items.length > 0) {
        io.emit('order_status_updated', parentOrder);
    } else if (parentOrder && parentOrder.items.length === 0) {
        io.emit('order_status_updated', { ...parentOrder, status: OrderStatus.COMPLETED });
    }

    io.emit('order_status_updated', { id: itemId, status: OrderStatus.CANCELLED });

    res.json({ status: 'success', message: 'Item cancelled' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to cancel item' });
  }
};