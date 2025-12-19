"use client";

import { useParams } from "next/navigation";
import LandingPage from "@/components/LandingPage";
import en from "@/locales/en";
import th from "@/locales/th";
import type { Dictionary } from "@/locales/dictionary";

export default function Page() {
  const params = useParams();
  
  const lang = (params.lang as string) || 'th';
  
  const dict: Dictionary = lang === 'en' ? en : th;

  return <LandingPage dict={dict} lang={lang} />;
}