import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import { Toaster } from "sonner";
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
  params: Promise<{ lang: string }>;
}

export default async function RootLayout({
  children,
  params, 
}: RootLayoutProps) {
  
  const { lang } = await params;

  return (
    <html lang={lang || 'en'}>
      <body className={`${kanit.className} antialiased`}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}