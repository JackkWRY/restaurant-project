"use client";

import { API_URL } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Calendar, Search, FileText, DollarSign, Eye, X, Receipt, StickyNote } from "lucide-react"; 
import dayjs from "dayjs";
import { ORDER_STATUS } from "@/config/enums";
import type { Dictionary } from "@/locales/dictionary";

interface BillItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  status: string;
  note: string | null;
}

interface Bill {
  id: string;
  date: string;
  tableName: string;
  total: number;
  paymentMethod: string;
  itemsCount: number;
  items: BillItem[];
}

interface HistoryData {
  summary: {
    totalSales: number;
    billCount: number;
  };
  bills: Bill[];
}

interface HistoryDashboardProps {
  dict: Dictionary;
}

export default function HistoryDashboard({ dict }: HistoryDashboardProps) {
  const [startDate, setStartDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(false);

  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/analytics/history?startDate=${startDate}&endDate=${endDate}`);
      const json = await res.json();
      if (json.status === 'success') {
        setData(json.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-6 relative">
      {/* Header */}
      <div className="mb-6">
         <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            📜 {dict.history?.title}
         </h1>
         <p className="text-slate-500">{dict.history?.subtitle}</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap gap-4 items-end">
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{dict.history?.startDate}</label>
            <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="border p-2 rounded-lg text-slate-700 outline-none focus:ring-2 focus:ring-purple-200"
            />
        </div>
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{dict.history?.endDate}</label>
            <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="border p-2 rounded-lg text-slate-700 outline-none focus:ring-2 focus:ring-purple-200"
            />
        </div>
        <button 
            onClick={fetchHistory}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 flex items-center gap-2 h-[42px] transition-all shadow-md hover:shadow-lg"
        >
            <Search size={18} /> {dict.history?.search}
        </button>
      </div>

      {/* Summary Cards */}
      {data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
                  <p className="text-slate-500 text-sm">{dict.history?.totalRevenue}</p>
                  <p className="text-2xl font-bold text-slate-800 flex items-center gap-1">
                      <DollarSign size={20} className="text-green-500"/> 
                      {data.summary.totalSales.toLocaleString()}
                  </p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
                  <p className="text-slate-500 text-sm">{dict.history?.totalBills}</p>
                  <p className="text-2xl font-bold text-slate-800 flex items-center gap-1">
                      <FileText size={20} className="text-blue-500"/> 
                      {data.summary.billCount}
                  </p>
              </div>
          </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th className="p-4 bg-slate-50">{dict.history?.date}</th>
                        <th className="p-4 bg-slate-50">{dict.history?.table}</th>
                        <th className="p-4 text-center bg-slate-50">{dict.history?.items}</th>
                        <th className="p-4 text-right bg-slate-50">{dict.history?.total}</th>
                        <th className="p-4 text-center bg-slate-50">{dict.dashboard?.view || 'View'}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {loading ? (
                        <tr><td colSpan={5} className="p-8 text-center text-slate-500">{dict.history?.loading}</td></tr>
                    ) : data?.bills.length === 0 ? (
                        <tr><td colSpan={5} className="p-8 text-center text-slate-500">{dict.history?.noData}</td></tr>
                    ) : (
                        data?.bills.map((bill) => (
                            <tr key={bill.id} className="hover:bg-purple-50 transition cursor-pointer" onClick={() => setSelectedBill(bill)}>
                                <td className="p-4 text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-slate-400"/>
                                        {dayjs(bill.date).format('DD/MM/YYYY HH:mm')}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1 font-mono">#{bill.id.split('-')[0]}</div>
                                </td>
                                <td className="p-4 font-bold text-slate-800">{bill.tableName}</td>
                                <td className="p-4 text-center text-slate-600">
                                    <span className="bg-slate-100 px-2 py-1 rounded-md text-xs font-bold border">
                                        {bill.itemsCount}
                                    </span>
                                </td>
                                <td className="p-4 text-right font-bold text-green-600">{dict.common?.currency}{bill.total.toLocaleString()}</td>
                                <td className="p-4 text-center">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setSelectedBill(bill); }}
                                        className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                                    >
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Modal Detail */}
      {selectedBill && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                  
                  {/* Modal Header */}
                  <div className="bg-purple-600 text-white p-4 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                          <Receipt size={20} />
                          <span className="font-bold text-lg">{dict.dashboard?.orderDetail || 'Bill Detail'}</span>
                      </div>
                      <button onClick={() => setSelectedBill(null)} className="p-1 hover:bg-white/20 rounded-full transition">
                          <X size={20} />
                      </button>
                  </div>

                  {/* Bill Info */}
                  <div className="p-6 bg-slate-50 border-b">
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-500 text-sm">{dict.history?.date}</span>
                          <span className="font-bold text-slate-800">{dayjs(selectedBill.date).format('DD/MM/YYYY HH:mm')}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-500 text-sm">{dict.history?.table}</span>
                          <span className="font-bold text-slate-800 text-lg">{selectedBill.tableName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-slate-500 text-sm">Bill ID</span>
                          <span className="font-mono text-xs text-slate-400">{selectedBill.id}</span>
                      </div>
                  </div>

                  {/* Items List */}
                  <div className="flex-1 overflow-y-auto p-6">
                      <table className="w-full text-sm">
                          <thead>
                              <tr className="text-slate-400 border-b">
                                  <th className="text-left pb-2 font-normal">{dict.dashboard?.items || 'Item'}</th>
                                  <th className="text-center pb-2 font-normal w-12">{dict.dashboard?.quantity || 'Qty'}</th>
                                  <th className="text-right pb-2 font-normal">{dict.dashboard?.totalPrice || 'Total'}</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {selectedBill.items.map((item, index) => (
                                  <tr key={index} className={`group ${item.status === ORDER_STATUS.CANCELLED ? 'opacity-50' : ''}`}>
                                      <td className="py-3 pr-2">
                                          <div className={`font-bold ${item.status === ORDER_STATUS.CANCELLED ? 'text-red-500 line-through' : 'text-slate-700'}`}>
                                            {item.name}
                                          </div>
                                          
                                          {item.note && (
                                            <div className="text-xs text-orange-500 italic flex items-center gap-1 mt-0.5">
                                                <StickyNote size={10} /> {item.note}
                                            </div>
                                          )}

                                          {item.status === ORDER_STATUS.CANCELLED && (
                                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold mt-1 inline-block">
                                                CANCELLED
                                            </span>
                                          )}

                                          <div className="text-xs text-slate-400">@{item.price}</div>
                                      </td>
                                      
                                      <td className="py-3 text-center">
                                          <span className={`font-bold rounded-lg px-2 py-1 ${item.status === ORDER_STATUS.CANCELLED ? 'bg-red-50 text-red-400 line-through' : 'bg-slate-50 text-slate-600'}`}>
                                            x{item.quantity}
                                          </span>
                                      </td>
                                      
                                      <td className={`py-3 text-right font-bold ${item.status === ORDER_STATUS.CANCELLED ? 'text-slate-300 line-through' : 'text-slate-800'}`}>
                                          {dict.common?.currency}{item.subtotal.toLocaleString()}
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>

                  {/* Footer Total */}
                  <div className="p-6 bg-slate-50 border-t space-y-2">
                      <div className="flex justify-between items-center">
                          <span className="text-slate-600">{dict.customer?.total}</span>
                          <span className="font-bold text-2xl text-purple-600">{dict.common?.currency}{selectedBill.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Payment</span>
                          <span className="font-bold text-slate-700 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs uppercase">{selectedBill.paymentMethod || 'CASH'}</span>
                      </div>
                      
                      <button 
                          onClick={() => setSelectedBill(null)}
                          className="w-full mt-4 bg-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-300 transition"
                      >
                          {dict.dashboard?.close || 'Close'}
                      </button>
                  </div>

              </div>
          </div>
      )}
    </div>
  );
}