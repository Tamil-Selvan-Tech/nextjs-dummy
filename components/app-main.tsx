"use client";

import { usePathname } from "next/navigation";

const authRoutes = new Set([
  "/login",
  "/signup",
  "/login-otp",
  "/forgot-password",
  "/reset-password",
  "/set-password",
  "/verify-email",
]);

export function AppMain({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthRoute = pathname ? authRoutes.has(pathname) : false;

  return <main className={isAuthRoute ? "pb-0" : "pb-[calc(6.75rem+env(safe-area-inset-bottom))] md:pb-0"}>{children}</main>;
}
