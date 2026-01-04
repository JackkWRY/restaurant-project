import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import "./globals.css";

const kanit = Kanit({ 
  weight: ['300', '400', '500', '700'], 
  subsets: ["thai", "latin"] 
});

export const metadata: Metadata = {
  title: "Restaurant App",
  description: "Restaurant Management System",
};

interface RootLayoutProps {
  children: React.ReactNode;
  params?: Promise<{ lang?: string }>;
}

export default async function RootLayout({
  children,
  params, 
}: RootLayoutProps) {
  
  const resolvedParams = params ? await params : {};
  const lang = resolvedParams.lang || 'en';

  return (
    <html lang={lang}>
      <body className={`${kanit.className} antialiased`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}