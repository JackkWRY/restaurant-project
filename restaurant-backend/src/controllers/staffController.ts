import type { Request, Response } from 'express';
import prisma from '../prisma.js';

// 1. ดึงสถานะทุกโต๊ะ พร้อมยอดเงินรวม (ของออเดอร์ที่ยังไม่จ่าย)
export const getTablesStatus = async (req: Request, res: Response) => {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { name: 'asc' },
      include: {
        orders: {
          where: {
            status: { not: 'COMPLETED' }
          },
          include: { items: true }
        }
      }
    });

    const tableData = tables.map(table => {
      const totalAmount = table.orders.reduce((sum, order) => sum + Number(order.totalPrice), 0);
      
      return {
        id: table.id,
        name: table.name,
        isOccupied: table.orders.length > 0,
        totalAmount: totalAmount,
        activeOrders: table.orders.length,
        isAvailable: table.isAvailable,
        isCallingStaff: table.isCallingStaff
      };
    });

    res.json({ status: 'success', data: tableData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch table status' });
  }
};

// 2. ปิดโต๊ะ (เช็คบิล)
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
      data: { isAvailable: false } 
    });

    console.log(`💰 Table ${id} closed and paid. Auto-OFF triggered.`);
    res.json({ status: 'success', message: 'Table closed and turned off' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to close table' });
  }
};

// 3. ดึงรายละเอียดของโต๊ะ (รายการอาหาร)
export const getTableDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const table = await prisma.table.findUnique({
      where: { id: Number(id) },
      include: {
        orders: {
          where: { status: { not: 'COMPLETED' } },
          include: {
            items: {
              include: { menu: true }
            }
          }
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
    res.status(500).json({ error: 'Failed to fetch table details' });
  }
};