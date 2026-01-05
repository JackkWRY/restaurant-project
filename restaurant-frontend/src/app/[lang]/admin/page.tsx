/**
 * @file Admin Dashboard Page
 * @description Admin dashboard page with server-side rendering
 * 
 * This page provides:
 * - Server-side dictionary loading
 * - Admin dashboard component
 * - Locale-based content
 * 
 * @module app/[lang]/admin/page
 * @requires @/locales/dictionary
 * @requires @/components/admin/AdminDashboard
 */

import { getDictionary } from "@/locales/dictionary";
import AdminDashboard from "@/components/admin/AdminDashboard";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function AdminPage({ params }: Props) {
  const { lang } = await params;

  const dict = await getDictionary(lang);

  return <AdminDashboard dict={dict} lang={lang} />;
}