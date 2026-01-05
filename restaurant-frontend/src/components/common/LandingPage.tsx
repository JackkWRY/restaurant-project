/**
 * @file Landing Page Component
 * @description Welcome page with QR code instruction and auto-redirect
 * 
 * This component handles:
 * - Display welcome message and QR code instruction
 * - Auto-redirect to order page if tableId in URL
 * - Language-aware routing
 * - Branding display
 * 
 * State management:
 * - URL parameter monitoring for tableId
 * 
 * Features:
 * - Auto-redirect when tableId detected
 * - QR code visual placeholder
 * - Responsive design
 * - Branding footer
 * 
 * @module components/common/LandingPage
 * @requires react
 * @requires next/navigation
 * @requires lucide-react
 * 
 * @see {@link CustomerOrder} for order page destination
 */

"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QrCode, UtensilsCrossed } from "lucide-react";
import type { Dictionary } from "@/locales/dictionary";

/**
 * Props for LandingPage component
 * 
 * @property {Dictionary} dict - Internationalization dictionary
 * @property {string} lang - Current language code
 * 
 * @example
 * <LandingPage dict={dictionary} lang="th" />
 */
interface LandingPageProps {
  dict: Dictionary;
  lang: string;
}

/**
 * Landing Page Component
 * 
 * Welcome page that displays QR code instruction.
 * Auto-redirects to order page when tableId is detected in URL.
 * 
 * @param props - Component props
 * @returns JSX.Element
 * 
 * @example
 * <LandingPage dict={dictionary} lang="th" />
 */
export default function LandingPage({ dict, lang }: LandingPageProps) {
  // Router for navigation
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableId = searchParams.get("tableId");

  // Auto-redirect to order page if tableId is present
  useEffect(() => {
    if (tableId) {
      router.replace(`/${lang}/order?tableId=${tableId}`);
    }
  }, [tableId, lang, router]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-900 text-white text-center">
      <div className="bg-white p-4 rounded-full mb-8 shadow-lg shadow-blue-500/20">
        <UtensilsCrossed size={64} className="text-slate-900" />
      </div>

      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        {dict.landing.welcome}
      </h1>
      
      <p className="text-slate-400 mb-10 max-w-xs mx-auto">
        {dict.landing.subtitle}
      </p>

      <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 flex flex-col items-center max-w-sm w-full">
        <div className="bg-white p-3 rounded-lg mb-4">
           <QrCode size={120} className="text-slate-900" />
        </div>
        <p className="text-sm text-slate-400">
          {dict.landing.scanToOrder}
        </p>
      </div>
      
      <footer className="absolute bottom-6 text-slate-600 text-xs">
        {dict.landing.poweredBy}
      </footer>
    </main>
  );
}