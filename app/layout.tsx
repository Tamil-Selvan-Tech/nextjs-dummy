import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { AppToastProvider } from "@/components/app-toast-provider";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { RouteHistoryTracker } from "@/components/route-history-tracker";
import "./globals.css";

export const metadata: Metadata = {
  title: "College EdwiseR",
  description: "College EdwiseR Next.js frontend",
  icons: {
    icon: "/Professional-collegeedwiser-logo.png",
    shortcut: "/Professional-collegeedwiser-logo.png",
    apple: "/Professional-collegeedwiser-logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-[family:var(--font-inter)]">
        <Suspense fallback={null}>
          <RouteHistoryTracker />
        </Suspense>
        <main className="pb-[calc(6.75rem+env(safe-area-inset-bottom))] md:pb-0">{children}</main>
        <MobileBottomNav />
        <AppToastProvider />
        <Footer />
      </body>
    </html>
  );
}
