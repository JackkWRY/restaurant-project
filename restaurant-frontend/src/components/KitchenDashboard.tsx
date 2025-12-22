"use client";

import { API_URL, fetcher } from "@/lib/utils";
import { APP_CONFIG } from "@/config/constants";
import { ORDER_STATUS, ROLE } from "@/config/enums";
import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link"; 
import { useRouter } from "next/navigation"; 
import { io, type Socket } from "socket.io-client"; 
import useSWR from "swr"; 
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Clock, ChefHat, BellRing, LogOut, LayoutDashboard, Globe } from "lucide-react"; 
import type { Dictionary } from "@/locales/dictionary";

// --- Types ---
type ItemStatus = ORDER_STATUS;

interface RawOrderItem {
  id: number;
  quantity: number;
  note?: string;
  status: ItemStatus;
  menu: {
    nameTH: string;
  };
}

interface RawOrder {
  id: number;
  table: {
    name: string;
  };
  createdAt: string;
  items: RawOrderItem[];
}

interface KitchenItem {
  id: number;          
  orderId: number;     
  tableName: string;   
  menuName: string;    
  quantity: number;    
  note?: string;       
  status: ItemStatus;
  createdAt: string;   
}

interface KitchenDashboardProps {
  dict: Dictionary;
  lang: string;
}

export default function KitchenDashboard({ dict, lang }: KitchenDashboardProps) {
  const router = useRouter(); 
  const [userRole, setUserRole] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const toggleLang = lang === 'en' ? 'th' : 'en';

  // 1. Data Fetching
  const { data: swrData, error, isLoading, mutate } = useSWR(`${API_URL}/api/orders/active`, fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });

  // 2. Derived State
  const items: KitchenItem[] = useMemo(() => {
    if (!swrData || swrData.status !== 'success') return [];

    const orders: RawOrder[] = swrData.data;
    return orders.flatMap((order) => 
      order.items
        .filter((item) => 
            item.status !== ORDER_STATUS.CANCELLED && 
            item.status !== ORDER_STATUS.SERVED && 
            item.status !== ORDER_STATUS.COMPLETED
        )
        .map((item) => ({
          id: item.id,
          orderId: order.id,
          tableName: order.table.name,
          menuName: item.menu.nameTH,
          quantity: item.quantity,
          note: item.note,
          status: item.status,
          createdAt: order.createdAt
        }))
    );
  }, [swrData]);

  // 3. Auth Logic
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token) {
      router.push(`/${lang}/login`); 
    } else if (userStr) {
        try {
            const user = JSON.parse(userStr);
            setUserRole(user.role);
        } catch (e) {
            console.error("Error parsing user data", e);
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleLogout = () => {
    if (confirm(dict.common.logoutConfirm)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push(`/${lang}/login`);
    }
  };

  // 4. Socket Integration
  useEffect(() => {
    if (!localStorage.getItem("token")) return;

    if (!socketRef.current) {
        socketRef.current = io(API_URL);
        
        socketRef.current.on("new_order", () => {
            mutate();
            try {
                const audio = new Audio(APP_CONFIG.SOUNDS.NOTIFICATION);
                audio.play().catch((err) => console.log("Audio play blocked (User must interact first):", err));
            } catch (error) {
                console.error("Error playing sound:", error);
            }
        });
        
        socketRef.current.on("item_status_updated", () => {
           mutate();
        });

        socketRef.current.on("order_status_updated", () => {
            mutate();
        });
    }

    return () => { 
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    };
  }, [mutate]); 

  // 5. Action Handler
  const handleUpdateStatus = async (itemId: number, newStatus: ItemStatus) => {
    try {
      await fetch(`${API_URL}/api/orders/items/${itemId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      mutate();
    } catch (error) { 
        console.error(error); 
    }
  };

  const pendingItems = items.filter(i => i.status === ORDER_STATUS.PENDING);
  const cookingItems = items.filter(i => i.status === ORDER_STATUS.COOKING);
  const readyItems = items.filter(i => i.status === ORDER_STATUS.READY);

  if (isLoading) return <div className="min-h-screen bg-slate-900 text-white flex justify-center items-center">{dict.common.loading}</div>;
  
  if (error) return <div className="min-h-screen bg-slate-900 text-white flex justify-center items-center">{dict.common.error}</div>;

  return (
    <main className="h-screen flex flex-col p-4 bg-slate-900 text-white overflow-hidden">
      
      {/* Header */}
      <header className="shrink-0 flex justify-between items-center mb-4 flex-wrap gap-4">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            👨‍🍳 {dict.kitchen.title}
            <span className="text-xs font-normal bg-green-600 px-3 py-1 rounded-full animate-pulse">{dict.kitchen.live}</span>
        </h1>
        <div className="flex items-center gap-2">
            
            {userRole === ROLE.ADMIN && (
                <Link href={`/${lang}/admin`} className="bg-purple-600 hover:bg-purple-700 p-2 rounded-full transition-colors" title={dict.admin.title}>
                    <LayoutDashboard size={20} />
                </Link>
             )}
            
            <Link 
                href={`/${toggleLang}/kitchen`}
                className="flex items-center gap-1 text-sm font-bold text-slate-300 hover:text-white px-3 py-1 bg-slate-800 rounded-full border border-slate-700 hover:bg-slate-700 transition-all"
            >
                <Globe size={16} /> {lang.toUpperCase()}
            </Link>

            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 p-2 rounded-full transition-colors" title={dict.common.logout}>
                <LogOut size={20} />
            </button>
        </div>
      </header>

      {/* Grid Container */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
        
        {/* Column 1: PENDING */}
        <div className="flex flex-col h-full bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <h2 className="shrink-0 font-bold text-lg text-yellow-400 flex items-center gap-2 p-4 pb-2 border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm z-10">
                <Clock /> {dict.kitchen.pending} 
                <span className="ml-auto bg-slate-700 px-2 rounded text-white text-sm">{pendingItems.length}</span>
            </h2>
            <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-3 custom-scrollbar">
                {pendingItems.map(item => (
                    <KitchenCard key={item.id} item={item} 
                        btnLabel={`🔥 ${dict.kitchen.startCook}`} 
                        btnColor="bg-yellow-600 hover:bg-yellow-700" 
                        onAction={() => handleUpdateStatus(item.id, ORDER_STATUS.COOKING)} 
                    />
                ))}
            </div>
        </div>

        {/* Column 2: COOKING */}
        <div className="flex flex-col h-full bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <h2 className="shrink-0 font-bold text-lg text-orange-400 flex items-center gap-2 p-4 pb-2 border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm z-10">
                <ChefHat /> {dict.kitchen.cooking} 
                <span className="ml-auto bg-slate-700 px-2 rounded text-white text-sm">{cookingItems.length}</span>
            </h2>
            <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-3 custom-scrollbar">
                {cookingItems.map(item => (
                    <KitchenCard key={item.id} item={item} 
                        btnLabel={`✅ ${dict.kitchen.finishCook}`} 
                        btnColor="bg-orange-600 hover:bg-orange-700" 
                        onAction={() => handleUpdateStatus(item.id, ORDER_STATUS.READY)}
                    />
                ))}
            </div>
        </div>

        {/* Column 3: READY */}
        <div className="flex flex-col h-full bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <h2 className="shrink-0 font-bold text-lg text-green-400 flex items-center gap-2 p-4 pb-2 border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm z-10">
                <BellRing /> {dict.kitchen.ready} 
                <span className="ml-auto bg-slate-700 px-2 rounded text-white text-sm">{readyItems.length}</span>
            </h2>
            <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-3 custom-scrollbar">
                {readyItems.map(item => (
                    <KitchenCard key={item.id} item={item} 
                        btnLabel={`🚀 ${dict.kitchen.served}`} 
                        btnColor="bg-green-600 hover:bg-green-700 shadow-green-900/20" 
                        onAction={() => handleUpdateStatus(item.id, ORDER_STATUS.SERVED)} 
                    />
                ))}
            </div>
        </div>

      </div>
    </main>
  );
}

function KitchenCard({ item, btnLabel, btnColor, onAction }: { item: KitchenItem, btnLabel: string, btnColor: string, onAction: () => void }) {
    return (
        <Card className="bg-slate-800 border-slate-600 text-slate-100 shadow-lg">
            <CardHeader className="p-3 bg-slate-900/50 flex flex-row justify-between items-start border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                        {item.tableName}
                    </span>
                    <span className="text-xs text-slate-400">#{item.orderId}</span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                    {new Date(item.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute:'2-digit' })}
                </div>
            </CardHeader>
            <CardContent className="p-3">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="text-lg font-bold text-white leading-tight">{item.menuName}</div>
                        {item.note && (
                          <div className="text-red-400 text-sm italic mt-1 break-words">
                            *{item.note}
                          </div>
                        )}
                    </div>
                    <div className="bg-slate-700 px-3 py-1 rounded-lg ml-2">
                        <span className="text-xl font-bold text-yellow-500">x{item.quantity}</span>
                    </div>
                </div>

                <button 
                    className={`w-full py-3 rounded-lg font-bold text-sm transition-all active:scale-95 shadow-md ${btnColor}`} 
                    onClick={onAction}
                >
                    {btnLabel}
                </button>
            </CardContent>
        </Card>
    );
}