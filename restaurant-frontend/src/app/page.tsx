import MenuItem from "@/components/MenuItem"; // Import เมนูแบบกดสั่งได้
import FloatingCart from "@/components/FloatingCart"; // Import ตะกร้าลอย

// 1. กำหนด Type ให้ตรงกับข้อมูลที่ Backend ส่งมา
interface Menu {
  id: number;
  nameTH: string;
  price: number;
  imageUrl: string | null;
}

interface Category {
  id: number;
  name: string;
  menus: Menu[];
}

interface ApiResponse {
  status: string;
  data: Category[];
}

// 2. ฟังก์ชันดึงข้อมูล (Server-Side Fetching)
async function getMenus() {
  try {
    // ยิงไปที่ Backend Port 3000
    // cache: 'no-store' เพื่อให้ข้อมูลไม่อัปเดตตลอดเวลา
    const res = await fetch('http://localhost:3000/api/menus', {
      cache: 'no-store' 
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }
    
    return res.json() as Promise<ApiResponse>;
  } catch (error) {
    console.error("Error fetching menus:", error);
    return null;
  }
}

// 3. หน้าจอหลัก (Home Page)
export default async function Home() {
  // เรียกใช้ฟังก์ชันดึงข้อมูล
  const response = await getMenus();
  const categories = response?.data || [];

  return (
    <main className="container mx-auto p-4 max-w-md min-h-screen bg-white pb-24">
      {/* pb-24 เว้นที่ด้านล่างไว้ให้ FloatingCart ไม่บังเนื้อหา */}

      <header className="mb-6 text-center mt-4">
        <h1 className="text-3xl font-bold text-slate-900">ร้านอาหารตามสั่ง 🍳</h1>
        <p className="text-slate-500 text-sm">ยินดีต้อนรับ กรุณาเลือกเมนู</p>
      </header>
      
      {categories.length === 0 ? (
        <div className="text-center p-10 bg-slate-50 rounded-lg border border-dashed">
          <p className="text-red-500 font-medium">ไม่พบเมนูอาหาร</p>
          <p className="text-xs text-gray-400 mt-2">ตรวจสอบว่า Backend (Port 3000) รันอยู่หรือไม่</p>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((cat) => (
            <section key={cat.id}>
              {/* หัวข้อหมวดหมู่ */}
              <h2 className="text-xl font-bold mb-3 text-slate-800 border-l-4 border-slate-800 pl-3">
                {cat.name}
              </h2>
              
              <div className="grid gap-4">
                {cat.menus.map((menu) => (
                  // เรียกใช้ Component MenuItem แทน Code เดิม
                  <MenuItem 
                    key={menu.id}
                    id={menu.id}
                    nameTH={menu.nameTH}
                    price={menu.price}
                    imageUrl={menu.imageUrl}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* แปะ FloatingCart ไว้ล่างสุด */}
      <FloatingCart />
    </main>
  );
}
