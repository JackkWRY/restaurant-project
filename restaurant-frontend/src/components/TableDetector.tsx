"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";

export default function TableDetector() {
  const searchParams = useSearchParams();
  const { setTableId } = useCartStore();

  useEffect(() => {
    const id = searchParams.get("tableId");
    
    if (id) {
      console.log("📍 Detected Table ID:", id);
      setTableId(Number(id));
    }
  }, [searchParams, setTableId]);

  return null;
}