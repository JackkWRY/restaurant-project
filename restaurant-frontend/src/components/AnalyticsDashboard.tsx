"use client";

import useSWR from 'swr';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, Award } from 'lucide-react';
import type { Dictionary } from '@/locales/en';

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

interface ApiResponse {
  status: string;
  data: AnalyticsData;
}

// ✅ เพิ่ม Interface Props รับ dict
interface AnalyticsDashboardProps {
  dict: Dictionary;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());
const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export default function AnalyticsDashboard({ dict }: AnalyticsDashboardProps) {
    const { data, isLoading, error } = useSWR<ApiResponse>('http://localhost:3000/api/analytics/summary', fetcher, {
        refreshInterval: 30000 
    });

    if (error) return <div className="p-8 text-red-500 text-center">{dict.dashboard.error}</div>;
    if (isLoading) return <div className="p-8 text-slate-500 text-center animate-pulse">{dict.dashboard.loading}</div>;

    const { todayTotal, todayCount, salesTrend, topItems } = data?.data || {};

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
                
                {/* กราฟแท่ง */}
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

                {/* กราฟวงกลม */}
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
        </div>
    );
}