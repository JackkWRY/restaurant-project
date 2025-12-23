import type { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { BillStatus, OrderStatus } from '../config/enums.js';
import { checkoutSchema } from '../schemas/billSchema.js';

type CheckoutInput = z.infer<typeof checkoutSchema>;

export const getTableBill = async (req: Request, res: Response) => {
    try {
        const tableId = Number(req.params.tableId);

        const activeBill = await prisma.bill.findFirst({
            where: {
                tableId: tableId,
                status: BillStatus.OPEN
            },
            include: {
                orders: {
                    include: {
                        items: {
                            include: { menu: true }
                        }
                    }
                }
            }
        });

        if (!activeBill) {
            res.status(404).json({ error: 'No active bill found for this table' });
            return;
        }

        const allItems = activeBill.orders.flatMap(order => 
            order.items.map(item => ({
                id: item.id,
                menuName: item.menu.nameTH,
                price: Number(item.menu.price),
                quantity: item.quantity,
                status: item.status,
                total: Number(item.menu.price) * item.quantity
            }))
        );

        const totalAmount = allItems.reduce((sum, item) => {
            return item.status === OrderStatus.CANCELLED ? sum : sum + item.total;
        }, 0);

        res.json({
            status: 'success',
            data: {
                billId: activeBill.id,
                tableId: activeBill.tableId,
                items: allItems,
                totalAmount: totalAmount
            }
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bill' });
    }
};

export const checkoutTable = async (req: Request, res: Response) => {
    try {
        const { tableId, paymentMethod } = req.body as CheckoutInput;

        const activeBill = await prisma.bill.findFirst({
            where: {
                tableId: tableId,
                status: BillStatus.OPEN
            },
            include: { orders: { include: { items: { include: { menu: true } } } } }
        });

        if (!activeBill) {
            res.status(404).json({ error: 'Active bill not found' });
            return;
        }

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
                paymentMethod: paymentMethod
            }
        });

        await prisma.table.update({
            where: { id: tableId },
            data: {
                isOccupied: false,
                isCallingStaff: false
            }
        });

        const io = req.app.get('io');
        io.emit('table_updated', { id: tableId, isOccupied: false });

        res.json({ status: 'success', message: 'Bill closed successfully' });

    } catch (error) {
        res.status(500).json({ error: 'Failed to checkout' });
    }
};