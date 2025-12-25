import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../prisma.js';
import { BillStatus, OrderStatus } from '../config/enums.js';
import dayjs from 'dayjs';

type BillWithRelations = Prisma.BillGetPayload<{
    include: {
        table: true;
        orders: {
            include: {
                items: {
                    include: { menu: true }
                }
            }
        }
    }
}>;

export const getAnalyticsSummary = async (req: Request, res: Response) => {
    try {
        const today = dayjs().startOf('day').toDate();
        const sevenDaysAgo = dayjs().subtract(7, 'day').startOf('day').toDate();

        const todaySales = await prisma.bill.aggregate({
            _sum: { totalPrice: true },
            _count: { id: true },
            where: {
                closedAt: { gte: today },
                status: BillStatus.PAID
            }
        });

        const pastBills = await prisma.bill.findMany({
            where: {
                closedAt: { gte: sevenDaysAgo },
                status: BillStatus.PAID
            },
            select: {
                closedAt: true,
                totalPrice: true
            }
        });

        const salesTrend = Array.from({ length: 7 }).map((_, i) => {
            const dateObj = dayjs().subtract(6 - i, 'day');
            const dateKey = dateObj.format('YYYY-MM-DD');
            const dateLabel = dateObj.format('DD/MM');
            
            const dailyTotal = pastBills
                .filter(b => b.closedAt && dayjs(b.closedAt).format('YYYY-MM-DD') === dateKey)
                .reduce((sum, bill) => sum + (Number(bill.totalPrice) || 0), 0);

            return { name: dateLabel, total: dailyTotal };
        });

        const topItemsGrouped = await prisma.orderItem.groupBy({
            by: ['menuId'],
            _sum: { quantity: true },
            where: { status: { not: OrderStatus.CANCELLED } },
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
        res.status(500).json({ error: 'Failed to fetch analytics summary' });
    }
};

export const getDailyBills = async (req: Request, res: Response) => {
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
            orderBy: { updatedAt: 'desc' }
        });

        const formattedBills = bills.map((bill: BillWithRelations) => {
            const allItems = bill.orders.flatMap((order) => 
                order.items.map((item) => ({
                    id: item.id,
                    quantity: item.quantity,
                    menuName: item.menu.nameTH,
                    price: Number(item.menu.price),
                    status: item.status,
                    note: item.note
                }))
            );

            let displayTotal = 0;
            if (bill.status === BillStatus.PAID) {
                displayTotal = Number(bill.totalPrice);
            } else {
                displayTotal = allItems.reduce((sum, item) => {
                    if (item.status === OrderStatus.CANCELLED) return sum;
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

        res.json({ status: 'success', data: formattedBills });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch daily bills' });
    }
};

export const getBillHistory = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const start = startDate ? dayjs(startDate as string).startOf('day').toDate() : dayjs().startOf('month').toDate();
        const end = endDate ? dayjs(endDate as string).endOf('day').toDate() : dayjs().endOf('day').toDate();

        const where = {
            status: BillStatus.PAID,
            closedAt: { gte: start, lte: end }
        };

        const [bills, total, totalSalesResult] = await Promise.all([
            prisma.bill.findMany({
                where,
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
                orderBy: { closedAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.bill.count({ where }),
            prisma.bill.aggregate({
                where,
                _sum: { totalPrice: true }
            })
        ]);

        const totalSales = Number(totalSalesResult._sum.totalPrice) || 0;

        const formattedBills = bills.map((bill: BillWithRelations) => ({
            id: bill.id,
            date: bill.closedAt,
            tableName: bill.table.name,
            total: Number(bill.totalPrice),
            paymentMethod: bill.paymentMethod,
            itemsCount: bill.orders.reduce((sum, o) => sum + o.items.length, 0),
            
            items: bill.orders.flatMap((order) => 
                order.items.map((item) => ({
                    id: item.id,
                    name: item.menu.nameTH,
                    price: Number(item.menu.price),
                    quantity: item.quantity,
                    subtotal: item.status === OrderStatus.CANCELLED ? 0 : (Number(item.menu.price) * item.quantity),
                    status: item.status,
                    note: item.note
                }))
            )
        }));

        res.json({
            status: 'success',
            data: {
                summary: { totalSales, billCount: total },
                bills: formattedBills
            },
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bill history' });
    }
};