/**
 * @file Customer Order Page
 * @description Customer ordering page with Suspense boundary
 * 
 * This page provides:
 * - Client-side rendering
 * - Suspense for loading state
 * - Language detection
 * - Customer order component
 * 
 * @module app/[lang]/order/page
 * @requires react
 * @requires next/navigation
 * @requires @/components/customer/CustomerOrder
 * @requires @/locales
 */

"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import CustomerOrder from "@/components/customer/CustomerOrder";
import en from "@/locales/en";
import th from "@/locales/th";
import type { Dictionary } from "@/locales/dictionary";

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