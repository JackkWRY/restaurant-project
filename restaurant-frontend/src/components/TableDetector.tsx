"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";

export default function TableDetector() {
  const searchParams = useSearchParams();
  const { setTableId } = useCartStore();

  useEffect(() => {
    // ดึงค่า ?tableId=... จาก URL
    const id = searchParams.get("tableId");
    
    if (id) {
      console.log("📍 Detected Table ID:", id);
      setTableId(Number(id)); // บันทึกลง Store
    }
  }, [searchParams, setTableId]);

  return null; // Component นี้ไม่ต้องแสดงผลอะไร แค่ทำงานเบื้องหลัง
}