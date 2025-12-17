"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import type { Dictionary } from "@/locales/en";

interface TableDetectorProps {
  dict: Dictionary;
}

export default function TableDetector({ dict }: TableDetectorProps) {
  const searchParams = useSearchParams();
  const { setTableId } = useCartStore();

  useEffect(() => {
    const idStr = searchParams.get("tableId");
    
    if (idStr) {
      const id = Number(idStr);

      if (isNaN(id)) {
        console.error("Invalid Table ID");
      } else {
        console.log("📍 Detected Table ID:", id);
        setTableId(id);
      }
    }
  }, [searchParams, setTableId, dict]);

  return null;
}