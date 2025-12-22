import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "th"];
const defaultLocale = "en";

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