"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Menu {
  id: number;
  nameTH: string;
  price: number;
  imageUrl: string | null;
  categoryId: number;
}

export default function AdminMenuPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  // State สำหรับฟอร์ม
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImage, setNewImage] = useState("");

  // ✅ แยกฟังก์ชันออกมาเป็นตัวแปรปกติ (ไม่ต้องใช้ useCallback)
  const fetchMenus = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/menus/all');
      const data = await res.json();
      setMenus(data.data);
    } catch (error) {
      console.error("Failed to fetch menus", error);
    }
  };

  // ✅ ใช้ useEffect แบบมีตัวเช็ค (Mounted Flag)
  // วิธีนี้เป็นท่ามาตรฐานที่แก้ปัญหา Linter ได้แน่นอนครับ
  useEffect(() => {
    let isMounted = true; // ตัวแปรเช็คว่าหน้าจอยังอยู่ไหม

    const initFetch = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/menus/all');
        const data = await res.json();
        if (isMounted) { // เช็คก่อน set state
          setMenus(data.data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    initFetch();

    // Cleanup function: จะทำงานเมื่อปิดหน้านี้
    return () => {
      isMounted = false; 
    };
  }, []); // [] ว่างไว้ เพื่อให้รันแค่ครั้งแรก

  const handleDelete = async (id: number) => {
    if (!confirm("ยืนยันที่จะลบเมนูนี้?")) return;
    try {
        await fetch(`http://localhost:3000/api/menus/${id}`, { method: 'DELETE' });
        fetchMenus(); // เรียกฟังก์ชันด้านนอกเพื่อรีเฟรชข้อมูล
    } catch (error) {
        console.error(error);
        alert("ลบไม่สำเร็จ");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameTH: newName,
          nameEN: newName, 
          price: newPrice,
          categoryId: 1, 
          imageUrl: newImage
        })
      });
      if (res.ok) {
        alert("เพิ่มเมนูสำเร็จ!");
        setIsCreating(false);
        setNewName(""); setNewPrice(""); setNewImage("");
        fetchMenus();
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาด");
    }
  };

  return (
    <main className="container mx-auto p-6 min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">จัดการเมนูอาหาร (Admin)</h1>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
        >
          {isCreating ? "ปิดฟอร์ม" : "+ เพิ่มเมนูใหม่"}
        </button>
      </header>

      {/* Form เพิ่มเมนู */}
      {isCreating && (
        <div className="bg-slate-100 p-6 rounded-lg mb-8 shadow-inner border">
          <h2 className="text-xl font-bold mb-4">เพิ่มเมนูใหม่</h2>
          <form onSubmit={handleCreate} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium">ชื่อเมนู</label>
              <input 
                type="text" 
                required
                className="w-full border p-2 rounded"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">ราคา</label>
              <input 
                type="number" 
                required
                className="w-full border p-2 rounded"
                value={newPrice}
                onChange={e => setNewPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">URL รูปภาพ</label>
              <input 
                type="text" 
                className="w-full border p-2 rounded"
                placeholder="https://..."
                value={newImage}
                onChange={e => setNewImage(e.target.value)}
              />
            </div>
            <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded">
              บันทึก
            </button>
          </form>
        </div>
      )}

      {/* ตารางรายการอาหาร */}
      <div className="bg-white shadow rounded-lg overflow-hidden border">
        <table className="w-full text-left">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="p-4">รูป</th>
              <th className="p-4">ชื่อเมนู</th>
              <th className="p-4">ราคา</th>
              <th className="p-4 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {menus.map((menu) => (
              <tr key={menu.id} className="hover:bg-slate-50">
                <td className="p-4">
                  <div className="w-16 h-16 relative bg-slate-200 rounded overflow-hidden">
                    {menu.imageUrl && (
                      <Image src={menu.imageUrl} alt={menu.nameTH} fill className="object-cover" />
                    )}
                  </div>
                </td>
                <td className="p-4 font-bold">{menu.nameTH}</td>
                <td className="p-4">฿{menu.price}</td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleDelete(menu.id)}
                    className="text-red-500 hover:text-red-700 font-bold border border-red-200 px-3 py-1 rounded"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}