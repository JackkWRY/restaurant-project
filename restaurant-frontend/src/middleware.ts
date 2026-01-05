/**
 * @file Next.js Middleware
 * @description Handles internationalization and authentication routing
 * 
 * This middleware provides:
 * - Automatic locale detection and redirection
 * - Protected route authentication
 * - Cookie-based token verification
 * 
 * Features:
 * - i18n support (en, th)
 * - Protected paths (/admin, /staff, /kitchen)
 * - Automatic login redirect for unauthenticated users
 * 
 * @module middleware
 * @requires next/server
 * 
 * @see {@link https://nextjs.org/docs/app/building-your-application/routing/middleware}
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Supported locales
const locales = ["en", "th"];
const defaultLocale = "en";

// Protected paths requiring authentication
const protectedPaths = ["/admin", "/staff", "/kitchen"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") || 
    pathname.startsWith("/_next") ||
    pathname.includes(".") 
  ) {
    return;
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  let locale = defaultLocale;
  
  if (pathnameHasLocale) {
    locale = pathname.split('/')[1];
  } else {
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  const isProtected = protectedPaths.some((path) => pathname.includes(path));
  
  const token = request.cookies.get("token");

  if (isProtected && !token) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  return;
}

export const config = {
  matcher: ["/((?!_next).*)"],
};