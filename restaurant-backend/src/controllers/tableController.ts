import type { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import logger from '../config/logger.js';
import { CLIENT_URL } from '../config/index.js';
import { OrderStatus, BillStatus } from '../config/enums.js';
import { sendSuccess, sendCreated, sendError, sendBadRequest, sendNotFound } from '../utils/apiResponse.js';
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

const FRONTEND_URL = CLIENT_URL;

/**
 * Creates a new table with auto-generated QR code
 * 
 * @param req - Express request with table name in body
 * @param res - Express response
 * @returns 201 with created table including QR code URL
 * 
 * @example
 * POST /api/tables
 * Body: { "name": "Table 1" }
 */
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

    sendCreated(res, updatedTable);
  } catch (error) {
    sendError(res, 'Failed to create table');
  }
};

/**
 * Updates table name
 * 
 * @param req - Express request with table ID in params and new name in body
 * @param res - Express response
 * @returns 200 with updated table
 */
export const updateTable = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const body = req.body as UpdateTableInput;

    const updatedTable = await prisma.table.update({
      where: { id: Number(id) },
      data: { name: body.name }
    });

    sendSuccess(res, updatedTable);
  } catch (error) {
    logger.error('Update table name error', { error: error instanceof Error ? error.message : 'Unknown error', tableId: id });
    sendError(res, 'Failed to update table name');
  }
};

/**
 * Deletes a table and all associated orders
 * 
 * Cascades deletion to remove all orders and order items for this table
 * to maintain data integrity.
 * 
 * @param req - Express request with table ID in params
 * @param res - Express response
 * @returns 200 on successful deletion
 */
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

    sendSuccess(res, undefined, 'Table deleted');
  } catch (error) {
    sendError(res, 'Failed to delete table');
  }
};

/**
 * Toggles table availability status
 * 
 * @param req - Express request with table ID in params and isAvailable boolean in body
 * @param res - Express response
 * @returns 200 with updated table
 */
export const toggleAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body as ToggleAvailabilityInput;

    const updatedTable = await prisma.table.update({
      where: { id: Number(id) },
      data: { isAvailable: body.isAvailable }
    });

    sendSuccess(res, updatedTable);
  } catch (error) {
    sendError(res, 'Failed to update availability');
  }
};

/**
 * Retrieves a single table by ID
 * 
 * @param req - Express request with table ID in params
 * @param res - Express response
 * @returns 200 with table data or 404 if not found
 */
export const getTableById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const table = await prisma.table.findUnique({ where: { id: Number(id) } });

    if (!table) {
      sendNotFound(res, 'Table not found');
      return;
    }
    
    sendSuccess(res, table);
  } catch (error) {
    sendError(res, 'Error fetching table');
  }
};

/**
 * Updates call staff status and broadcasts via Socket.IO
 * 
 * Emits real-time updates to both authenticated (staff/kitchen) and
 * public (customer) namespaces for immediate notification.
 * 
 * @param req - Express request with table ID in params and isCalling boolean in body
 * @param res - Express response
 * @returns 200 with updated table
 */
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

    // Emit to authenticated namespace (Staff/Kitchen)
    const authenticatedNs = req.app.get('authenticatedNamespace');
    authenticatedNs.emit('table_updated', payload);

    // Emit to public namespace (Customer at specific table)
    const publicNs = req.app.get('publicNamespace');
    publicNs.to(`table-${id}`).emit('table_updated', {
      id: Number(id),
      isCallingStaff: body.isCalling
    });

    sendSuccess(res, payload);
  } catch (error) {
    sendError(res, 'Failed to update call staff status');
  }
};

/**
 * Closes a table and finalizes the bill
 * 
 * Workflow:
 * 1. Validates all items are served/completed
 * 2. Closes active bill with final total
 * 3. Marks all orders as completed
 * 4. Resets table status
 * 5. Broadcasts updates via Socket.IO
 * 
 * @param req - Express request with table ID in params
 * @param res - Express response
 * @returns 200 on success, 400 if items are unserved
 */
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
      sendBadRequest(res, 'Cannot close table. Some items are not yet SERVED or COMPLETED.');
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

    // Emit to authenticated namespace (Staff/Kitchen)
    const authenticatedNs = req.app.get('authenticatedNamespace');
    authenticatedNs.emit('table_updated', { id: Number(id) });

    // Emit to public namespace (Customer at specific table)
    const publicNs = req.app.get('publicNamespace');
    publicNs.to(`table-${id}`).emit('table_updated', {
      id: Number(id),
      isOccupied: false,
      isAvailable: false
    });

    sendSuccess(res, undefined, 'Table and Bill closed successfully');

  } catch (error) {
    sendError(res, 'Failed to close table');
  }
};

/**
 * Retrieves status of all tables with order information
 * 
 * Returns comprehensive table data including active orders,
 * occupation status, and call staff indicators.
 * 
 * @param req - Express request
 * @param res - Express response
 * @returns 200 with array of tables and their status
 */
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

    sendSuccess(res, tableData);
  } catch (error) {
    logger.error('Fetch table status error', { error: error instanceof Error ? error.message : 'Unknown error' });
    sendError(res, 'Failed to fetch table status');
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
      sendNotFound(res, 'Table not found');
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

    sendSuccess(res, { ...table, items: allItems });
  } catch (error) {
    logger.error('Fetch table details error', { error: error instanceof Error ? error.message : 'Unknown error' });
    sendError(res, 'Failed to fetch details');
  }
};