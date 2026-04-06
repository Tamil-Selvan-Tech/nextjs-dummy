import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "College EdwiseR",
  description: "College EdwiseR Next.js frontend",
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
        <Footer />
      </body>
    </html>
  );
}
