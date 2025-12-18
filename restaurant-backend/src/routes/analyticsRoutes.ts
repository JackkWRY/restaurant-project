import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

const router = Router();
const prisma = new PrismaClient();

router.get('/summary', async (req: Request, res: Response): Promise<any> => {
    try {
        const today = dayjs().startOf('day').toDate();
        const sevenDaysAgo = dayjs().subtract(7, 'day').startOf('day').toDate();

        const todaySales = await prisma.order.aggregate({
            _sum: { totalPrice: true }, 
            _count: { id: true },
            where: {
                createdAt: { gte: today },
                status: { not: 'CANCELLED' }
            }
        });

        const pastOrders = await prisma.order.findMany({
            where: {
                createdAt: { gte: sevenDaysAgo },
                status: { not: 'CANCELLED' }
            },
            select: {
                createdAt: true,
                totalPrice: true
            }
        });

        const salesTrend = Array.from({ length: 7 }).map((_, i) => {
            const dateObj = dayjs().subtract(6 - i, 'day');
            const dateLabel = dateObj.format('DD/MM');
            const dateKey = dateObj.format('YYYY-MM-DD');
            
            const dailyTotal = pastOrders
                .filter(o => dayjs(o.createdAt).format('YYYY-MM-DD') === dateKey)
                .reduce((sum, order) => sum + (Number(order.totalPrice) || 0), 0);

            return { name: dateLabel, total: dailyTotal };
        });

        const topItemsGrouped = await prisma.orderItem.groupBy({
            by: ['menuId'],
            _sum: { quantity: true },
            orderBy: {
                _sum: { quantity: 'desc' }
            },
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

        const totalSalesValue = todaySales._sum.totalPrice ? Number(todaySales._sum.totalPrice) : 0;
        const totalOrdersCount = todaySales._count.id || 0;

        res.json({
            status: 'success',
            data: {
                todayTotal: totalSalesValue,
                todayCount: totalOrdersCount,
                salesTrend,
                topItems
            }
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

export default router;