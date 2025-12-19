"use client";

import { API_URL } from "@/lib/utils";
import { APP_CONFIG } from "@/config/constants";
import { useState } from 'react';
import useSWR from 'swr';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, Award, Clock, Receipt, Eye, X, MessageSquareText } from 'lucide-react';
import type { Dictionary } from "@/locales/dictionary";

// --- Types ---
interface TopItem {
  name: string;
  value: number;
  [key: string]: string | number | undefined; 
}

interface SalesTrend {
  name: string;
  total: number;
  [key: string]: string | number | undefined;
}

interface AnalyticsData {
  todayTotal: number;
  todayCount: number;
  salesTrend: SalesTrend[];
  topItems: TopItem[];
}

interface OrderItem {
    id: number;
    menuName: string;
    quantity: number;
    price: number;
    note?: string | null;
    status: string;
}

interface Order {
    id: string;
    tableId: number;
    totalPrice: number;
    status: string;
    createdAt: string;
    items: OrderItem[];
}

interface ApiResponse {
  status: string;
  data: AnalyticsData;
}

interface OrderHistoryResponse {
    status: string;
    data: Order[];
}

interface AnalyticsDashboardProps {
  dict: Dictionary;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());
const COLORS = APP_CONFIG.CHART_COLORS;

export default function AnalyticsDashboard({ dict }: AnalyticsDashboardProps) {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const { data: summaryData, isLoading: summaryLoading, error: summaryError } = useSWR<ApiResponse>(`${API_URL}/api/analytics/summary`, fetcher, { refreshInterval: 30000 });
    const { data: ordersData, isLoading: ordersLoading } = useSWR<OrderHistoryResponse>(`${API_URL}/api/analytics/orders`, fetcher, { refreshInterval: 10000 });

    if (summaryError) return <div className="p-8 text-red-500 text-center">{dict.dashboard.error}</div>;
    if (summaryLoading) return <div className="p-8 text-slate-500 text-center animate-pulse">{dict.dashboard.loading}</div>;

    const { todayTotal, todayCount, salesTrend, topItems } = summaryData?.data || {};
    const recentOrders = ordersData?.data || [];

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
                    <div className="p-4 bg-green-100 text-green-600 rounded-full shadow-inner">
                        <DollarSign size={32} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">{dict.dashboard.todaySales}</p>
                        <h3 className="text-3xl font-bold text-slate-800">฿{todayTotal?.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
                    <div className="p-4 bg-purple-100 text-purple-600 rounded-full shadow-inner">
                        <ShoppingBag size={32} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">{dict.dashboard.todayOrders}</p>
                        <h3 className="text-3xl font-bold text-slate-800">{todayCount} <span className="text-sm font-normal text-slate-400">{dict.dashboard.bills}</span></h3>
                    </div>
                </div>
            </div>

            {/* 2. Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[400px] flex flex-col">
                    <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-blue-500"/> {dict.dashboard.salesTrend}
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `฿${value}`} />
                                <Tooltip 
                                    cursor={{fill: '#f1f5f9'}}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number | undefined) => [`฿${(value ?? 0).toLocaleString()}`, dict.dashboard.total]}
                                />
                                <Bar dataKey="total" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[400px] flex flex-col">
                    <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                        <Award size={20} className="text-orange-500"/> {dict.dashboard.bestSellers}
                    </h3>
                    <div className="flex-1 w-full min-h-0 relative">
                        {topItems && topItems.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={topItems}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {topItems.map((entry: TopItem, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-slate-400">{dict.dashboard.noData}</div>
                        )}
                        
                        <div className="absolute top-0 right-0 flex flex-col gap-2 text-xs">
                            {topItems?.map((item: TopItem, index: number) => (
                                <div key={index} className="flex items-center gap-1">
                                    <span className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></span>
                                    <span className="text-slate-600 truncate max-w-[100px]">{item.name}</span>
                                    <span className="font-bold text-slate-800">({item.value})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Recent Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <Receipt size={20} className="text-purple-600"/> {dict.dashboard.recentOrders}
                    </h3>
                </div>
                
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-sm font-semibold sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="p-4 bg-slate-50">{dict.dashboard.time}</th>
                                <th className="p-4 bg-slate-50">{dict.dashboard.table}</th>
                                <th className="p-4 bg-slate-50">{dict.dashboard.items}</th>
                                <th className="p-4 bg-slate-50">{dict.dashboard.totalPrice}</th>
                                <th className="p-4 text-center bg-slate-50">{dict.dashboard.status}</th>
                                <th className="p-4 text-right bg-slate-50">{dict.dashboard.view}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {ordersLoading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-400 animate-pulse">
                                        {dict.dashboard.loading || "Loading..."}
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 text-slate-600 font-medium whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={14} className="text-slate-400"/>
                                                    {formatTime(order.createdAt)}
                                                </div>
                                            </td>
                                            <td className="p-4 font-bold text-slate-800">
                                                {order.tableId}
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-slate-600">
                                                    {order.items.slice(0, 2).map((item, idx) => (
                                                        <div key={idx} className={item.status === 'CANCELLED' ? 'line-through opacity-50 text-red-400' : ''}>
                                                            {item.quantity}x {item.menuName}
                                                        </div>
                                                    ))}
                                                    {order.items.length > 2 && <div className="text-xs text-slate-400">+{order.items.length - 2} items...</div>}
                                                </div>
                                            </td>
                                            <td className="p-4 font-bold text-purple-600">
                                                ฿{Number(order.totalPrice).toLocaleString()}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                                                    order.status === 'COMPLETED' 
                                                    ? 'bg-green-100 text-green-700 border-green-200' 
                                                    : order.status === 'PAID'
                                                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                                                    : order.status === 'PENDING'
                                                    ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {recentOrders.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-slate-400">
                                                {dict.dashboard.noData}
                                            </td>
                                        </tr>
                                    )}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 4. Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">{dict.dashboard.orderDetail || "Order Detail"}</h3>
                                <p className="text-xs text-slate-500">#{selectedOrder.id} • {formatDate(selectedOrder.createdAt)} {formatTime(selectedOrder.createdAt)}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-dashed">
                                <span className="text-slate-500 font-bold">{dict.dashboard.table}</span>
                                <span className="text-2xl font-bold text-purple-600">{selectedOrder.tableId}</span>
                            </div>

                            <table className="w-full text-sm">
                                <thead className="text-slate-500 border-b">
                                    <tr>
                                        <th className="text-left py-2">{dict.dashboard.items}</th>
                                        <th className="text-center py-2">{dict.dashboard.quantity}</th>
                                        <th className="text-right py-2">{dict.dashboard.subtotal}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {selectedOrder.items.map((item, idx) => (
                                        <tr key={idx} className={item.status === 'CANCELLED' ? 'bg-red-50/50' : ''}>
                                            <td className="py-3">
                                                <div className={`font-medium ${item.status === 'CANCELLED' ? 'text-red-400 line-through' : 'text-slate-800'}`}>
                                                    {item.menuName}
                                                </div>
                                                
                                                {item.note && (
                                                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                                        <MessageSquareText size={10} /> {item.note}
                                                    </div>
                                                )}

                                                {item.status === 'CANCELLED' && (
                                                    <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold mt-1 inline-block">
                                                        Cancelled
                                                    </span>
                                                )}
                                            </td>
                                            <td className={`py-3 text-center ${item.status === 'CANCELLED' ? 'text-red-300' : 'text-slate-600'}`}>
                                                x{item.quantity}
                                            </td>
                                            <td className="py-3 text-right font-bold">
                                                {item.status === 'CANCELLED' ? (
                                                    <span className="text-slate-300 line-through">฿{(item.price * item.quantity).toLocaleString()}</span>
                                                ) : (
                                                    <span className="text-slate-800">฿{(item.price * item.quantity).toLocaleString()}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-slate-50 p-4 border-t flex justify-between items-center">
                            <span className="text-slate-500 font-bold">{dict.dashboard.totalPrice}</span>
                            <span className="text-2xl font-bold text-purple-600">฿{Number(selectedOrder.totalPrice).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}