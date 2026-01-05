/**
 * @file Kitchen Dashboard Page
 * @description Kitchen display system page with server-side rendering
 * 
 * This page provides:
 * - Server-side dictionary loading
 * - Kitchen dashboard component
 * - Locale-based content
 * 
 * @module app/[lang]/kitchen/page
 * @requires @/locales/dictionary
 * @requires @/components/kitchen/KitchenDashboard
 */

import { getDictionary } from "@/locales/dictionary";
import KitchenDashboard from "@/components/kitchen/KitchenDashboard";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function KitchenPage({ params }: Props) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <KitchenDashboard dict={dict} lang={lang} />;
}