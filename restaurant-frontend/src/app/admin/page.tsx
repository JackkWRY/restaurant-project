"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image"; 
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, List, Utensils, X, Image as ImageIcon, Save, Settings, Eye, EyeOff, LogOut } from "lucide-react";

// --- Types ---
interface Category {
  id: number;
  name: string;
  _count?: { menus: number };
}

interface Menu {
  id: number;
  nameTH: string;
  price: number;
  imageUrl: string | null;
  categoryId: number;
  category?: { name: string };
  isRecommended?: boolean;
  isAvailable?: boolean;
  isVisible?: boolean;
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'categories' | 'menus' | 'settings'>('categories');

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    if (confirm("ต้องการออกจากระบบใช่หรือไม่?")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard 🛠️</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/staff" className="text-sm font-medium text-slate-500 hover:text-slate-900">
                ไปหน้า Staff →
            </Link>
            <button onClick={handleLogout} className="text-sm font-medium text-red-500 hover:text-red-700 flex items-center gap-1 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                <LogOut size={16} /> ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 flex-1 flex gap-6">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
           <nav className="flex flex-col gap-2">
              <button 
                onClick={() => setActiveTab('categories')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-left transition-colors ${
                    activeTab === 'categories' ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                 <List size={20} /> จัดการหมวดหมู่
              </button>
              <button 
                onClick={() => setActiveTab('menus')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-left transition-colors ${
                    activeTab === 'menus' ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                 <Utensils size={20} /> จัดการเมนูอาหาร
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-left transition-colors ${
                    activeTab === 'settings' ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                 <Settings size={20} /> ตั้งค่าร้าน
              </button>
           </nav>
        </aside>

        {/* Content Area */}
        <section className="flex-1 bg-white rounded-2xl shadow-sm border p-6 min-h-[500px]">
            {activeTab === 'categories' && <CategoryManager />}
            {activeTab === 'menus' && <MenuManager />}
            {activeTab === 'settings' && <SettingsManager />}
        </section>
      </div>
    </main>
  );
}

// ==========================================
// 🟢 Component: Settings Manager
// ==========================================
function SettingsManager() {
    const [restaurantName, setRestaurantName] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('http://localhost:3000/api/settings/name');
                const data = await res.json();
                if (data.status === 'success') setRestaurantName(data.data);
            } catch (error) { console.error(error); }
        };
        fetchSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3000/api/settings/name', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: restaurantName })
            });
            if (res.ok) alert("บันทึกชื่อร้านเรียบร้อยแล้ว ✅");
            else alert("บันทึกไม่สำเร็จ");
        } catch (error) { console.error(error); alert("เกิดข้อผิดพลาด"); }
        finally { setLoading(false); }
    };

    return (
        <div className="max-w-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Settings className="text-purple-600"/> ตั้งค่าร้าน
            </h2>
            
            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">ชื่อร้านอาหาร (ที่แสดงในหน้าลูกค้า)</label>
                    <input 
                        type="text" 
                        required 
                        className="w-full border p-3 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                        value={restaurantName}
                        onChange={(e) => setRestaurantName(e.target.value)}
                        placeholder="เช่น ร้านเจ๊ไฝ ประตูผี"
                    />
                </div>
                
                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 flex items-center gap-2 disabled:bg-slate-400"
                >
                    {loading ? "กำลังบันทึก..." : <><Save size={20} /> บันทึกการเปลี่ยนแปลง</>}
                </button>
            </form>
        </div>
    );
}

// ==========================================
// 🟢 Component: Category Manager
// ==========================================
function CategoryManager() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [loading, setLoading] = useState(true);

    const refreshCategories = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/categories');
            const data = await res.json();
            if (data.status === 'success') setCategories(data.data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        let isMounted = true; 
        const initFetch = async () => {
            try {
                const res = await fetch('http://localhost:3000/api/categories');
                const data = await res.json();
                if (isMounted && data.status === 'success') {
                    setCategories(data.data);
                }
            } catch (error) { console.error(error); } 
            finally { if (isMounted) setLoading(false); }
        };
        initFetch();
        return () => { isMounted = false; };
    }, []);

    const handleCreate = async () => {
        if (!newCategoryName.trim()) return;
        try {
            await fetch('http://localhost:3000/api/categories', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ name: newCategoryName })
            });
            setNewCategoryName("");
            refreshCategories();
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("ยืนยันลบหมวดหมู่นี้?")) return;
        try {
            const res = await fetch(`http://localhost:3000/api/categories/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) refreshCategories();
            else alert(data.error);
        } catch (error) { console.error(error); }
    };

    const handleUpdate = async (id: number, oldName: string) => {
        const newName = prompt("แก้ไขชื่อหมวดหมู่:", oldName);
        if (!newName || newName === oldName) return;
        try {
            await fetch(`http://localhost:3000/api/categories/${id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ name: newName })
            });
            refreshCategories();
        } catch (error) { console.error(error); }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <List className="text-purple-600"/> รายการหมวดหมู่
            </h2>

            <div className="flex gap-2 mb-6">
                <input 
                    type="text" 
                    placeholder="ชื่อหมวดหมู่ใหม่..." 
                    className="flex-1 border p-3 rounded-lg bg-slate-50 focus:bg-white transition-colors"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <button onClick={handleCreate} className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 flex items-center gap-2">
                    <Plus size={20} /> เพิ่ม
                </button>
            </div>

            {loading ? <p className="text-slate-500">กำลังโหลด...</p> : (
                <div className="space-y-3">
                    {categories.map((cat) => (
                        <div key={cat.id} className="flex justify-between items-center bg-white border p-4 rounded-xl hover:shadow-md transition-shadow group">
                            <div>
                                <span className="font-bold text-lg text-slate-800">{cat.name}</span>
                                <span className="ml-3 text-sm text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                                    {cat._count?.menus || 0} เมนู
                                </span>
                            </div>
                            <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleUpdate(cat.id, cat.name)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={18} /></button>
                                <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))}
                    {categories.length === 0 && <p className="text-center text-slate-400 py-10">ยังไม่มีหมวดหมู่</p>}
                </div>
            )}
        </div>
    );
}

// ==========================================
// 🟡 Component: Menu Manager
// ==========================================
function MenuManager() {
    const [menus, setMenus] = useState<Menu[]>([]); 
    const [categories, setCategories] = useState<Category[]>([]);
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    
    const [newName, setNewName] = useState("");
    const [newPrice, setNewPrice] = useState("");
    const [newCategoryId, setNewCategoryId] = useState("");
    const [newImage, setNewImage] = useState("");
    const [isRecommended, setIsRecommended] = useState(false);
    const [isAvailable, setIsAvailable] = useState(true);
    const [isVisible, setIsVisible] = useState(true);

    const refreshData = async () => {
        try {
            const [resMenus, resCats] = await Promise.all([
                fetch('http://localhost:3000/api/menus/all'),
                fetch('http://localhost:3000/api/categories')
            ]);
            
            const dataMenus = await resMenus.json();
            const dataCats = await resCats.json();
            
            if (dataMenus.status === 'success') setMenus(dataMenus.data);
            if (dataCats.status === 'success') setCategories(dataCats.data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        refreshData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const resetForm = () => {
        setNewName("");
        setNewPrice("");
        setNewCategoryId("");
        setNewImage("");
        setIsRecommended(false);
        setIsAvailable(true);
        setIsVisible(true);
        setEditingId(null);
        setIsFormOpen(false);
    };

    const handleStartEdit = (menu: Menu) => {
        setNewName(menu.nameTH);
        setNewPrice(menu.price.toString());
        setNewCategoryId(menu.categoryId.toString());
        setNewImage(menu.imageUrl || "");
        setIsRecommended(menu.isRecommended || false);
        setIsAvailable(menu.isAvailable !== undefined ? menu.isAvailable : true);
        setIsVisible(menu.isVisible !== undefined ? menu.isVisible : true);
        
        setEditingId(menu.id);
        setIsFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const payload = {
            nameTH: newName,
            nameEN: newName, 
            price: newPrice,
            categoryId: newCategoryId, 
            imageUrl: newImage,
            isRecommended: isRecommended,
            isAvailable: isAvailable,
            isVisible: isVisible
        };

        try {
            let res;
            if (editingId) {
                res = await fetch(`http://localhost:3000/api/menus/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch('http://localhost:3000/api/menus', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (res.ok) {
                alert(editingId ? "แก้ไขเมนูสำเร็จ!" : "เพิ่มเมนูสำเร็จ!");
                resetForm();
                refreshData(); 
            } else {
                alert("เกิดข้อผิดพลาด กรุณาตรวจสอบข้อมูล");
            }
        } catch (error) { console.error(error); alert("เกิดข้อผิดพลาดในการเชื่อมต่อ"); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("ยืนยันลบเมนูนี้?")) return;
        try {
            await fetch(`http://localhost:3000/api/menus/${id}`, { method: 'DELETE' });
            refreshData(); 
        } catch (error) { console.error(error); }
    };

    const handleQuickToggle = async (id: number, field: 'isAvailable' | 'isVisible', currentValue: boolean | undefined) => {
        try {
            const newValue = !currentValue;
            const res = await fetch(`http://localhost:3000/api/menus/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: newValue }) 
            });
            if (res.ok) refreshData();
        } catch (error) { console.error(error); }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Utensils className="text-purple-600"/> รายการอาหาร ({menus.length})
                </h2>
                <button 
                    onClick={() => isFormOpen ? resetForm() : setIsFormOpen(true)}
                    className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors ${
                        isFormOpen ? "bg-slate-200 text-slate-600" : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                >
                    {isFormOpen ? <><X size={18}/> ยกเลิก</> : <><Plus size={18}/> เพิ่มเมนูใหม่</>}
                </button>
            </div>

            {isFormOpen && (
                <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-xl border mb-6 animate-in fade-in slide-in-from-top-4 relative">
                    <div className={`absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded ${editingId ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}>
                        {editingId ? "โหมดแก้ไข" : "โหมดสร้างใหม่"}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">ชื่อเมนู</label>
                            <input required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-200 outline-none" value={newName} onChange={e => setNewName(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">ราคา (บาท)</label>
                            <input required type="number" className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-200 outline-none" value={newPrice} onChange={e => setNewPrice(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">หมวดหมู่</label>
                            <select 
                                required 
                                className="w-full border p-2 rounded bg-white focus:ring-2 focus:ring-purple-200 outline-none"
                                value={newCategoryId}
                                onChange={e => setNewCategoryId(e.target.value)}
                            >
                                <option value="">-- เลือกหมวดหมู่ --</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">รูปภาพ URL</label>
                            <input type="text" placeholder="https://..." className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-200 outline-none" value={newImage} onChange={e => setNewImage(e.target.value)} />
                        </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-6 border-t pt-4 border-slate-200">
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="isRecommended" checked={isRecommended} onChange={(e) => setIsRecommended(e.target.checked)} className="w-5 h-5 accent-orange-500 cursor-pointer"/>
                            <label htmlFor="isRecommended" className="text-slate-700 font-bold cursor-pointer select-none">เมนูแนะนำ ★</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="isAvailable" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} className="w-5 h-5 accent-green-600 cursor-pointer"/>
                            <label htmlFor="isAvailable" className="text-slate-700 font-bold cursor-pointer select-none">มีของ (Available)</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="isVisible" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} className="w-5 h-5 accent-blue-600 cursor-pointer"/>
                            <label htmlFor="isVisible" className="text-slate-700 font-bold cursor-pointer select-none">แสดงในเมนู (Visible)</label>
                        </div>
                    </div>
                    
                    <div className="mt-6 flex gap-2">
                        <button type="submit" className={`px-6 py-2 rounded-lg font-bold text-white flex items-center gap-2 ${editingId ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}>
                            <Save size={18} /> {editingId ? "บันทึกการแก้ไข" : "สร้างเมนูใหม่"}
                        </button>
                        {editingId && (
                            <button type="button" onClick={resetForm} className="px-6 py-2 rounded-lg font-bold bg-slate-200 text-slate-600 hover:bg-slate-300">
                                ยกเลิก
                            </button>
                        )}
                    </div>
                </form>
            )}

            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
                <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 font-bold text-sm">
                        <tr>
                            <th className="p-4">รูป</th>
                            <th className="p-4">ชื่อเมนู</th>
                            <th className="p-4">ราคา</th>
                            <th className="p-4 text-center">สถานะของ</th>
                            <th className="p-4 text-center">การแสดงผล</th>
                            <th className="p-4 text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {menus.map((menu) => (
                            <tr key={menu.id} className={`transition-colors ${editingId === menu.id ? "bg-blue-50" : "hover:bg-slate-50"}`}>
                                <td className="p-4 w-20">
                                    <div className="w-12 h-12 bg-slate-200 rounded-lg overflow-hidden flex items-center justify-center text-slate-400 relative">
                                        {menu.imageUrl ? (
                                            <Image src={menu.imageUrl} alt={menu.nameTH} fill className="object-cover" unoptimized />
                                        ) : <ImageIcon size={20}/>}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-slate-800">{menu.nameTH}</div>
                                    <div className="text-xs text-slate-500">{menu.category?.name || '-'}</div>
                                    {menu.isRecommended && <span className="text-[10px] bg-orange-100 text-orange-600 px-1 py-0.5 rounded font-bold">★ แนะนำ</span>}
                                </td>
                                <td className="p-4 font-bold text-slate-900">฿{menu.price}</td>
                                
                                <td className="p-4 text-center">
                                    <button 
                                        onClick={() => handleQuickToggle(menu.id, 'isAvailable', menu.isAvailable)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold border w-24 transition-colors ${
                                            menu.isAvailable 
                                            ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200" 
                                            : "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                                        }`}
                                    >
                                        {menu.isAvailable ? "🟢 มีของ" : "🔴 หมด"}
                                    </button>
                                </td>

                                <td className="p-4 text-center">
                                    <button 
                                        onClick={() => handleQuickToggle(menu.id, 'isVisible', menu.isVisible)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold border w-24 transition-colors flex items-center justify-center gap-1 mx-auto ${
                                            menu.isVisible 
                                            ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200" 
                                            : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                                        }`}
                                    >
                                        {menu.isVisible ? <><Eye size={12}/> แสดง</> : <><EyeOff size={12}/> ซ่อน</>}
                                    </button>
                                </td>

                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-1">
                                        <button onClick={() => handleStartEdit(menu)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors" title="แก้ไข"><Pencil size={18} /></button>
                                        <button onClick={() => handleDelete(menu.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="ลบ"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {menus.length === 0 && <div className="text-center py-10 text-slate-400">ยังไม่มีเมนูอาหาร</div>}
            </div>
        </div>
    );
}