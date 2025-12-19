import type { Request, Response } from 'express';
import prisma from '../prisma.js';

export const getTableBill = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tableId } = req.params;

        const activeBill = await prisma.bill.findFirst({
            where: {
                tableId: Number(tableId),
                status: 'OPEN'
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
            return item.status === 'CANCELLED' ? sum : sum + item.total;
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
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch bill' });
    }
};

export const checkoutTable = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tableId, paymentMethod } = req.body;

        const activeBill = await prisma.bill.findFirst({
            where: {
                tableId: Number(tableId),
                status: 'OPEN'
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
                if (item.status !== 'CANCELLED') {
                    finalTotal += Number(item.menu.price) * item.quantity;
                }
            });
        });

        await prisma.bill.update({
            where: { id: activeBill.id },
            data: {
                status: 'PAID',
                closedAt: new Date(),
                totalPrice: finalTotal,
                paymentMethod: paymentMethod || 'CASH'
            }
        });

        await prisma.table.update({
            where: { id: Number(tableId) },
            data: {
                isOccupied: false,
                isCallingStaff: false
            }
        });

        const io = req.app.get('io');
        io.emit('table_updated', { id: Number(tableId), isOccupied: false });

        console.log(`✅ Bill ${activeBill.id} CLOSED. Total: ${finalTotal}`);
        res.json({ status: 'success', message: 'Bill closed successfully' });

    } catch (error) {
        console.error('Checkout Error:', error);
        res.status(500).json({ error: 'Failed to checkout' });
    }
};