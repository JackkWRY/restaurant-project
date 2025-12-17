"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import CustomerOrder from "@/components/CustomerOrder";
import { en } from "@/locales/en"; 
import { th } from "@/locales/th"; 
import type { Dictionary } from "@/locales/en"; 

export default function OrderPage() {
  const params = useParams(); 
  const lang = (params.lang as string) || 'th';
  const dict: Dictionary = lang === 'en' ? en : th; 

  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <CustomerOrder dict={dict} lang={lang} />
    </Suspense>
  );
}