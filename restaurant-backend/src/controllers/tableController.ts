import type { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import logger from '../config/logger.js';
import { OrderStatus, BillStatus } from '../config/enums.js';
import { 
  createTableSchema, 
  updateTableSchema, 
  toggleAvailabilitySchema, 
  updateCallStaffSchema 
} from '../schemas/tableSchema.js';

type CreateTableInput = z.infer<typeof createTableSchema>;
type UpdateTableInput = z.infer<typeof updateTableSchema>;
type ToggleAvailabilityInput = z.infer<typeof toggleAvailabilitySchema>;
type UpdateCallStaffInput = z.infer<typeof updateCallStaffSchema>;

const FRONTEND_URL = process.env.CLIENT_URL || 'http://localhost:3000';

export const createTable = async (req: Request, res: Response) => {
  try {
    const body = req.body as CreateTableInput;
    
    const newTable = await prisma.table.create({
      data: {
        name: body.name,
        qrCode: "" 
      }
    });

    const qrCodeUrl = `${FRONTEND_URL}/order?tableId=${newTable.id}`;

    const updatedTable = await prisma.table.update({
      where: { id: newTable.id },
      data: { qrCode: qrCodeUrl }
    });

    res.status(201).json({ status: 'success', data: updatedTable });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create table' });
  }
};

export const updateTable = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const body = req.body as UpdateTableInput;

    const updatedTable = await prisma.table.update({
      where: { id: Number(id) },
      data: { name: body.name }
    });

    res.json({ status: 'success', data: updatedTable });
  } catch (error) {
    logger.error('Update table name error', { error: error instanceof Error ? error.message : 'Unknown error', tableId: id });
    res.status(500).json({ error: 'Failed to update table name' });
  }
};

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
    res.status(500).json({ error: 'Failed to delete table' });
  }
};

export const toggleAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body as ToggleAvailabilityInput;

    const updatedTable = await prisma.table.update({
      where: { id: Number(id) },
      data: { isAvailable: body.isAvailable }
    });

    res.json({ status: 'success', data: updatedTable });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update availability' });
  }
};

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

export const updateCallStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body as UpdateCallStaffInput;

    const updatedTable = await prisma.table.update({
      where: { id: Number(id) },
      data: { isCallingStaff: body.isCalling },
      include: {
        orders: {
          where: { status: { not: OrderStatus.COMPLETED } }
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
    res.status(500).json({ error: 'Failed to update call staff status' });
  }
};

export const closeTable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const unservedItems = await prisma.orderItem.findFirst({
      where: {
        order: { 
          tableId: Number(id),
          status: { not: OrderStatus.COMPLETED }
        },
        status: {
          notIn: [OrderStatus.SERVED, OrderStatus.COMPLETED, OrderStatus.CANCELLED] 
        }
      }
    });

    if (unservedItems) {
      res.status(400).json({ 
        status: 'error', 
        error: 'Cannot close table. Some items are not yet SERVED or COMPLETED.' 
      });
      return; 
    }

    const activeBill = await prisma.bill.findFirst({
        where: {
            tableId: Number(id),
            status: BillStatus.OPEN
        },
        include: {
            orders: {
                include: { items: { include: { menu: true } } }
            }
        }
    });

    if (activeBill) {
        let finalTotal = 0;
        
        activeBill.orders.forEach(order => {
            order.items.forEach(item => {
                if (item.status !== OrderStatus.CANCELLED) {
                    finalTotal += Number(item.menu.price) * item.quantity;
                }
            });
        });

        await prisma.bill.update({
            where: { id: activeBill.id },
            data: {
                status: BillStatus.PAID,
                closedAt: new Date(),
                totalPrice: finalTotal,
                paymentMethod: 'CASH'
            }
        });
    }
    
    await prisma.orderItem.updateMany({
      where: {
        order: { 
          tableId: Number(id),
          status: { not: OrderStatus.COMPLETED }
        },
        status: { not: OrderStatus.CANCELLED }
      },
      data: { status: OrderStatus.COMPLETED }
    });

    await prisma.order.updateMany({
      where: { 
        tableId: Number(id),
        status: { not: OrderStatus.COMPLETED }
      },
      data: { status: OrderStatus.COMPLETED }
    });

    await prisma.table.update({
      where: { id: Number(id) },
      data: { 
        isOccupied: false,
        isCallingStaff: false,
        isAvailable: false
      }
    });

    const io = req.app.get('io');
    io.emit('table_updated', { id: Number(id) }); 

    res.json({ status: 'success', message: 'Table and Bill closed successfully' });

  } catch (error) {
    res.status(500).json({ error: 'Failed to close table' });
  }
};

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
    logger.error('Fetch table status error', { error: error instanceof Error ? error.message : 'Unknown error' });
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
    logger.error('Fetch table details error', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ error: 'Failed to fetch details' });
  }
};