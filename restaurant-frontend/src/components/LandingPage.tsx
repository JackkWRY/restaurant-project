"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QrCode, UtensilsCrossed } from "lucide-react";
import type { Dictionary } from "@/locales/en";

interface LandingPageProps {
  dict: Dictionary;
  lang: string;
}

export default function LandingPage({ dict, lang }: LandingPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableId = searchParams.get("tableId");

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