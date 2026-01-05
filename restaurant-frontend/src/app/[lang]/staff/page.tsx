/**
 * @file Staff Dashboard Page
 * @description Staff dashboard page with server-side rendering
 * 
 * This page provides:
 * - Server-side dictionary loading
 * - Staff dashboard component
 * - Locale-based content
 * 
 * @module app/[lang]/staff/page
 * @requires @/locales/dictionary
 * @requires @/components/staff/StaffDashboard
 */

import { getDictionary } from "@/locales/dictionary";
import StaffDashboard from "@/components/staff/StaffDashboard";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function StaffPage({ params }: Props) {
  const { lang } = await params;

  const dict = await getDictionary(lang);

  return <StaffDashboard dict={dict} lang={lang} />;
}
