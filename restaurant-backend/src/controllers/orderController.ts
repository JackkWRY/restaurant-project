import type { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { OrderStatus, BillStatus } from '../config/enums.js';
import { createOrderSchema } from '../schemas/orderSchema.js'; 

type OrderInput = z.infer<typeof createOrderSchema>;
type OrderItemInput = OrderInput['items'][number]; 

const recalculateBill = async (billId: string, tx: any = prisma) => {
    const bill = await tx.bill.findUnique({
        where: { id: billId },
        include: { orders: { include: { items: { include: { menu: true } } } } }
    });

    if (!bill) return;

    let newTotal = 0;
    bill.orders.forEach((order: any) => {
        order.items.forEach((item: any) => {
            if (item.status !== OrderStatus.CANCELLED) {
                newTotal += Number(item.menu.price) * item.quantity;
            }
        });
    });

    await tx.bill.update({
        where: { id: billId },
        data: { totalPrice: newTotal }
    });
};

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { tableId, items } = req.body as OrderInput;

        const newOrder = await prisma.$transaction(async (tx) => {
            const table = await tx.table.findUnique({ where: { id: Number(tableId) } });
            if (!table) throw new Error('Table not found'); 
            if (!table.isAvailable) throw new Error('Table closed'); 

            let currentOrderTotal = 0;
            for (const item of items) {
                const menu = await tx.menu.findUnique({ where: { id: Number(item.menuId) } });
                if (menu) {
                    currentOrderTotal += Number(menu.price) * item.quantity;
                }
            }

            let activeBill = await tx.bill.findFirst({
                where: {
                    tableId: Number(tableId),
                    status: BillStatus.OPEN
                }
            });

            if (!activeBill) {
                activeBill = await tx.bill.create({
                    data: {
                        tableId: Number(tableId),
                        status: BillStatus.OPEN,
                        totalPrice: 0
                    }
                });
            }

            const createdOrder = await tx.order.create({
                data: {
                    tableId: Number(tableId),
                    totalPrice: currentOrderTotal,
                    status: OrderStatus.PENDING,
                    billId: activeBill.id,
                    items: {
                        create: items.map((item: OrderItemInput) => ({
                            menuId: Number(item.menuId), 
                            quantity: item.quantity,
                            note: item.note || '',
                            status: OrderStatus.PENDING
                        })),
                    },
                },
                include: { items: { include: { menu: true } }, table: true },
            });

            await tx.bill.update({
                where: { id: activeBill.id },
                data: {
                    totalPrice: { increment: currentOrderTotal }
                }
            });

            await tx.table.update({
                where: { id: Number(tableId) },
                data: { isOccupied: true }
            });

            return createdOrder;
        });

        const io = req.app.get('io');
        io.emit('new_order', newOrder);

        res.status(201).json({ status: 'success', data: newOrder });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Failed to create order' });
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

        if (updatedOrder.billId) {
            await recalculateBill(updatedOrder.billId);
        }

        const io = req.app.get('io');
        io.emit('order_status_updated', updatedOrder);
        
        res.json({ status: 'success', data: updatedOrder });
    } catch (error) {
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

        if (updatedItem.order.billId) {
            await recalculateBill(updatedItem.order.billId);
        }

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
        res.status(500).json({ error: 'Failed to update item status' });
    }
};