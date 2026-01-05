/**
 * @file Landing Page
 * @description Home page that displays the landing page component
 * 
 * This page provides:
 * - Client-side rendering
 * - Language detection from URL params
 * - Dictionary selection based on locale
 * 
 * @module app/[lang]/page
 * @requires next/navigation
 * @requires @/components/common/LandingPage
 * @requires @/locales
 */

/**
 * @file Landing Page
 * @description Home page that displays the landing page component
 * 
 * This page provides:
 * - Client-side rendering
 * - Language detection from URL params
 * - Dictionary selection based on locale
 * 
 * @module app/[lang]/page
 * @requires next/navigation
 * @requires @/components/common/LandingPage
 * @requires @/locales
 */

"use client";

import { useParams } from "next/navigation";
import LandingPage from "@/components/common/LandingPage";
import en from "@/locales/en";
import th from "@/locales/th";
import type { Dictionary } from "@/locales/dictionary";

export default function Page() {
  const params = useParams();
  
  const lang = (params.lang as string) || 'th';
  
  const dict: Dictionary = lang === 'en' ? en : th;

  return <LandingPage dict={dict} lang={lang} />;
}