import type { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { BillStatus, OrderStatus } from '../config/enums.js';
import { checkoutSchema } from '../schemas/billSchema.js';

type CheckoutInput = z.infer<typeof checkoutSchema>;

const calculateBillData = (orders: any[]) => {
    let total = 0;
    const items: any[] = [];

    orders.forEach(order => {
        order.items.forEach((item: any) => {
            const itemTotal = Number(item.menu.price) * item.quantity;
            
            items.push({
                id: item.id,
                menuName: item.menu.nameTH,
                price: Number(item.menu.price),
                quantity: item.quantity,
                status: item.status,
                total: itemTotal,
                note: item.note || ''
            });

            if (item.status !== OrderStatus.CANCELLED) {
                total += itemTotal;
            }
        });
    });

    return { total, items };
};

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
            res.json({
                status: 'success',
                data: {
                    billId: null,
                    tableId: tableId,
                    items: [],
                    totalAmount: 0
                }
            });
            return;
        }

        const { total, items } = calculateBillData(activeBill.orders);

        res.json({
            status: 'success',
            data: {
                billId: activeBill.id,
                tableId: activeBill.tableId,
                items: items,
                totalAmount: total 
            }
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bill' });
    }
};

export const checkoutTable = async (req: Request, res: Response) => {
    try {
        const { tableId, paymentMethod } = req.body as CheckoutInput;

        await prisma.$transaction(async (tx) => {
            const activeBill = await tx.bill.findFirst({
                where: {
                    tableId: tableId,
                    status: BillStatus.OPEN
                },
                include: { orders: { include: { items: { include: { menu: true } } } } }
            });

            if (!activeBill) {
                throw new Error('ACTIVE_BILL_NOT_FOUND');
            }

            const { total } = calculateBillData(activeBill.orders);

            await tx.bill.update({
                where: { id: activeBill.id },
                data: {
                    status: BillStatus.PAID,
                    closedAt: new Date(),
                    totalPrice: total,
                    paymentMethod: paymentMethod
                }
            });

            await tx.table.update({
                where: { id: tableId },
                data: {
                    isOccupied: false,
                    isCallingStaff: false
                }
            });
        });

        const io = req.app.get('io');
        io.emit('table_updated', { id: tableId, isOccupied: false });

        res.json({ status: 'success', message: 'Bill closed successfully' });

    } catch (error: any) {
        if (error.message === 'ACTIVE_BILL_NOT_FOUND') {
             res.status(404).json({ error: 'Active bill not found' });
        } else {
             res.status(500).json({ error: 'Failed to checkout' });
        }
    }
};