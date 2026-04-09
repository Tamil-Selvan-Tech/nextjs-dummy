import type { Metadata, Viewport } from "next";
import { AppToastProvider } from "@/components/app-toast-provider";
import { Footer } from "@/components/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "College EdwiseR",
  description: "College EdwiseR Next.js frontend",
  icons: {
    icon: "/college.png",
    shortcut: "/college.png",
    apple: "/college.png",
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
      <body className="flex min-h-full flex-col">
        <main className="flex-1">{children}</main>
        <AppToastProvider />
        <Footer />
      </body>
    </html>
  );
}
