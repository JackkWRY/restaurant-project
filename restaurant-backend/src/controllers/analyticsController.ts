import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

export const getAnalyticsSummary = async (req: Request, res: Response): Promise<void> => {
    try {
        const today = dayjs().startOf('day').toDate();
        const sevenDaysAgo = dayjs().subtract(7, 'day').startOf('day').toDate();

        const todaySales = await prisma.bill.aggregate({
            _sum: { totalPrice: true },
            _count: { id: true },
            where: {
                closedAt: { gte: today },
                status: 'PAID'
            }
        });

        const pastBills = await prisma.bill.findMany({
            where: {
                closedAt: { gte: sevenDaysAgo },
                status: 'PAID'
            },
            select: {
                closedAt: true,
                totalPrice: true
            }
        });

        const salesTrend = Array.from({ length: 7 }).map((_, i) => {
            const dateObj = dayjs().subtract(6 - i, 'day');
            const dateLabel = dateObj.format('DD/MM');
            const dateKey = dateObj.format('YYYY-MM-DD');
            
            const dailyTotal = pastBills
                .filter(b => dayjs(b.closedAt).format('YYYY-MM-DD') === dateKey)
                .reduce((sum, bill) => sum + (Number(bill.totalPrice) || 0), 0);

            return { name: dateLabel, total: dailyTotal };
        });

        const topItemsGrouped = await prisma.orderItem.groupBy({
            by: ['menuId'],
            _sum: { quantity: true },
            where: { status: { not: 'CANCELLED' } },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5
        });

        const menuIds = topItemsGrouped.map(item => item.menuId);
        const menuNames = await prisma.menu.findMany({
            where: { id: { in: menuIds } },
            select: { id: true, nameTH: true }
        });

        const topItems = topItemsGrouped.map(item => {
            const menu = menuNames.find(m => m.id === item.menuId);
            return {
                name: menu?.nameTH || `Menu #${item.menuId}`,
                value: item._sum.quantity || 0
            };
        });

        res.json({
            status: 'success',
            data: {
                todayTotal: Number(todaySales._sum.totalPrice) || 0,
                todayCount: todaySales._count.id || 0,
                salesTrend,
                topItems
            }
        });

    } catch (error) {
        console.error("Analytics Summary Error:", error);
        res.status(500).json({ error: 'Failed to fetch analytics summary' });
    }
};

export const getDailyBills = async (req: Request, res: Response): Promise<void> => {
    try {
        const today = dayjs().startOf('day').toDate();

        const bills = await prisma.bill.findMany({
            where: {
                OR: [
                    { createdAt: { gte: today } },
                    { closedAt: { gte: today } }
                ]
            },
            include: {
                table: true,
                orders: {
                    include: {
                        items: {
                            include: { menu: true }
                        }
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc' 
            }
        });

        const formattedBills = bills.map((bill: any) => {
            const allItems = bill.orders.flatMap((order: any) => 
                order.items.map((item: any) => ({
                    id: item.id,
                    quantity: item.quantity,
                    menuName: item.menu.nameTH,
                    price: Number(item.menu.price),
                    status: item.status,
                    note: item.note
                }))
            );

            let displayTotal = 0;
            if (bill.status === 'PAID') {
                displayTotal = Number(bill.totalPrice);
            } else {
                displayTotal = allItems.reduce((sum: number, item: any) => {
                    if (item.status === 'CANCELLED') return sum;
                    return sum + (item.price * item.quantity);
                }, 0);
            }

            return {
                id: bill.id,
                tableId: bill.tableId,
                status: bill.status,
                createdAt: bill.createdAt,
                updatedAt: bill.updatedAt,
                totalPrice: displayTotal,
                items: allItems
            };
        });

        res.json({
            status: 'success',
            data: formattedBills
        });

    } catch (error) {
        console.error("Daily Bills Error:", error);
        res.status(500).json({ error: 'Failed to fetch daily bills' });
    }
};