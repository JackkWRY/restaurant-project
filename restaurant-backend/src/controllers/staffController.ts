import type { Request, Response } from 'express';
import prisma from '../prisma.js';

export const getTablesStatus = async (req: Request, res: Response) => {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { name: 'asc' },
      include: {
        orders: {
          where: {
            status: { notIn: ['COMPLETED', 'CANCELLED'] }
          },
          include: { items: true }
        }
      }
    });

    const tableData = tables.map(table => {
      const totalAmount = table.orders.reduce((sum, order) => sum + Number(order.totalPrice), 0);
      
      const readyCount = table.orders.filter(order => order.status === 'READY').length;

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

export const closeTable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.order.updateMany({
      where: {
        tableId: Number(id),
        status: { notIn: ['COMPLETED', 'CANCELLED'] }
      },
      data: { status: 'COMPLETED' }
    });
    await prisma.table.update({
      where: { id: Number(id) },
      data: { isOccupied: false, isCallingStaff: false } 
    });
    res.json({ status: 'success', message: 'Table closed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to close table' });
  }
};

export const getTableDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const table = await prisma.table.findUnique({
      where: { id: Number(id) },
      include: {
        orders: {
          where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
          include: { items: { include: { menu: true } } }
        }
      }
    });
    if (!table) { res.status(404).json({ error: 'Table not found' }); return; }
    const allItems = table.orders.flatMap(order => 
      order.items.map(item => ({
        id: item.id,
        menuName: item.menu.nameTH,
        price: Number(item.menu.price),
        quantity: item.quantity,
        total: Number(item.menu.price) * item.quantity,
        status: order.status
      }))
    );
    res.json({ status: 'success', data: { ...table, items: allItems } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch details' });
  }
};