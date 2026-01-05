/**
 * @file Login Page
 * @description Staff login page with server-side rendering
 * 
 * This page provides:
 * - Server-side dictionary loading
 * - Login form component
 * - Locale-based content
 * 
 * @module app/[lang]/login/page
 * @requires @/locales/dictionary
 * @requires @/components/common/LoginForm
 */

import { getDictionary } from "@/locales/dictionary";
import LoginForm from "@/components/common/LoginForm";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function LoginPage({ params }: Props) {
  const { lang } = await params;

  const dict = await getDictionary(lang);

  return <LoginForm dict={dict} lang={lang} />;
}