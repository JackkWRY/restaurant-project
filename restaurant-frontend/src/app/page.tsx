import { Suspense } from "react";
import { QrCode, Lock } from "lucide-react"; 
import MenuItem from "@/components/MenuItem"; 
import FloatingCart from "@/components/FloatingCart"; 
import TableDetector from "@/components/TableDetector"; 

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

async function getMenus() {
  try {
    const res = await fetch('http://localhost:3000/api/menus', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json() as Promise<ApiResponse>;
  } catch (error) {
    console.error("Error fetching menus:", error);
    return null;
  }
}

// ✅ ฟังก์ชันเช็คสถานะโต๊ะ
async function getTableStatus(tableId: string) {
    try {
        const res = await fetch(`http://localhost:3000/api/tables/${tableId}`, { cache: 'no-store' });
        if (!res.ok) return null;
        const json = await res.json();
        return json.data; 
    } catch (error) {
        console.error("Error fetching table status:", error); // ✅ เพิ่มบรรทัดนี้ (ใช้ตัวแปร error แล้ว)
        return null;
    }
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Home(props: Props) {
  const searchParams = await props.searchParams;
  const tableId = searchParams.tableId;

  // 1. GUARD: ไม่มีเลขโต๊ะ -> ให้สแกน QR
  if (!tableId) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-sm w-full">
          <div className="bg-slate-100 p-4 rounded-full mb-6">
            <QrCode size={64} className="text-slate-800" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">กรุณาสแกน QR Code</h1>
          <p className="text-slate-500 mb-6">
            เพื่อระบุโต๊ะและเริ่มสั่งอาหาร <br/>
            โปรดสแกน QR Code ที่อยู่บนโต๊ะของคุณ
          </p>
        </div>
      </main>
    );
  }

  // 2. GUARD: เช็คสถานะโต๊ะจาก Backend
  const table = await getTableStatus(tableId as string);
  
  // ถ้าหาโต๊ะไม่เจอ หรือ โต๊ะปิด (isAvailable = false)
  if (!table || !table.isAvailable) {
      return (
        <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-sm w-full border-t-4 border-red-500">
            <div className="bg-red-50 p-4 rounded-full mb-6">
                <Lock size={64} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">โต๊ะนี้ปิดให้บริการ</h1>
            <p className="text-slate-500 mb-6">
                ขออภัย โต๊ะหมายเลข {tableId} ไม่สามารถสั่งอาหารได้ในขณะนี้ <br/>
                กรุณาติดต่อพนักงาน
            </p>
            </div>
        </main>
      );
  }

  // --- ถ้าโต๊ะเปิดใช้งานปกติ ---
  const response = await getMenus();
  const categories = response?.data || [];

  return (
    <main className="container mx-auto p-4 max-w-md min-h-screen bg-white pb-24">
      
      <Suspense fallback={null}>
        <TableDetector />
      </Suspense>

      <header className="mb-6 text-center mt-4">
        <h1 className="text-3xl font-bold text-slate-900">ร้านอาหารตามสั่ง 🍳</h1>
        <p className="text-slate-500 text-sm">
          โต๊ะ: <span className="font-bold text-green-600 text-lg">{table?.name || tableId}</span> | ยินดีต้อนรับ
        </p>
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
              <h2 className="text-xl font-bold mb-3 text-slate-800 border-l-4 border-slate-800 pl-3">
                {cat.name}
              </h2>
              <div className="grid gap-4">
                {cat.menus.map((menu) => (
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

      <FloatingCart />
    </main>
  );
}