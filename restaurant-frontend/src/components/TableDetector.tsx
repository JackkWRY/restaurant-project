"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { logger } from "@/lib/logger";

export default function TableDetector() {
  const searchParams = useSearchParams();
  const { setTableId } = useCartStore();

  useEffect(() => {
    const idStr = searchParams.get("tableId");
    
    if (idStr) {
      const id = Number(idStr);

      if (isNaN(id)) {
        logger.error("Invalid Table ID");
      } else {
        logger.debug("Detected Table ID:", id);
        setTableId(id);
      }
    }
  }, [searchParams, setTableId]);

  return null;
}