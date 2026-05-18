"use client";

import { useState } from "react";
import {
  ChevronDown,
  Home,
  LayoutDashboard,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  X, // ✅ FIXED
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { PageBackButton } from "@/components/global-back-button";
import { clearAuth, type SafeAuthUser } from "@/lib/auth-storage";

type PortalShellProps = {
  title: string;
  subtitle: string;
  currentUser: SafeAuthUser | null;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

const navItems = [
  { href: "/college-dashboard", label: "Dashboard", icon: LayoutDashboard },
];

const getInitials = (value?: string) =>
  String(value || "CU")
    .split(" ")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item.charAt(0).toUpperCase())
    .join("");

export function CollegePortalShell({
  currentUser,
  children,
}: PortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    clearAuth();
    setShowLogoutConfirm(false);
    router.push("/login?type=college");
  };

  return (
    <>
      <section className="section-shell min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] text-[color:var(--text-dark)]">
        <div className="mesh-bg opacity-55" />
        <div className="hero-grid absolute inset-0 opacity-[0.04]" />

        <div className="page-container-full relative z-10 py-3 sm:py-4">
          <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] w-full gap-3 xl:grid-cols-[270px_minmax(0,1fr)]">

            {/* Sidebar */}
            <aside className="reveal-up rounded-[1.7rem] border border-[rgba(56,108,255,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,250,255,0.98))] p-4 shadow-[0_18px_40px_rgba(59,130,246,0.08)] xl:sticky xl:top-4 xl:self-start">

              {/* Top */}
              <div className="flex items-center justify-between gap-2">
                <BrandLogo className="h-8" />

                <span className="inline-flex items-center rounded-full border border-[rgba(15,76,129,0.08)] bg-white p-1.5 text-slate-900 shadow-[0_8px_18px_rgba(15,23,42,0.06)]">
                  <ShieldCheck className="size-3.5" />
                </span>
              </div>

              {/* User */}
              <div className="mt-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Signed In As
                </p>

                <div className="mt-3 rounded-[1.2rem] border border-[rgba(15,76,129,0.08)] bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                  <div className="flex items-center gap-2.5">

                    {/* Avatar */}
                    <div className="flex size-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2563eb,#60a5fa)] text-sm font-bold text-white">
                      {getInitials(currentUser?.name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {currentUser?.name || "College User"}
                      </p>

                      <p className="text-xs text-slate-600">
                        Administrator
                      </p>
                    </div>

                    <ChevronDown className="size-3.5 shrink-0 text-slate-500" />
                  </div>
                </div>

                {/* Contact */}
                <div className="mt-3 grid gap-2">

                  <div className="flex min-w-0 items-center gap-2 rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white px-3 py-2.5 text-xs text-slate-900 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
                    <Mail className="size-3.5 shrink-0 text-[#2563eb]" />

                    <span className="min-w-0 truncate">
                      {currentUser?.email || "-"}
                    </span>
                  </div>

                  <div className="flex min-w-0 items-center gap-2 rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white px-3 py-2.5 text-xs text-slate-900 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
                    <Phone className="size-3.5 shrink-0 text-[#2563eb]" />

                    <span className="min-w-0 truncate">
                      {currentUser?.phone || "No phone added"}
                    </span>
                  </div>

                </div>
              </div>

              {/* Navigation */}
              <nav className="mt-5 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;

                  const active =
                    pathname === item.href ||
                    (item.href !== "/college-dashboard" &&
                      pathname.startsWith(`${item.href}/`));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 rounded-[1rem] px-4 py-3 text-sm font-semibold transition ${
                        active
                          ? "bg-[linear-gradient(135deg,#2563eb,#3b82f6_55%,#60a5fa)] text-white shadow-[0_14px_28px_rgba(37,99,235,0.24)]"
                          : "border border-[rgba(15,76,129,0.08)] bg-white text-slate-900 shadow-[0_8px_18px_rgba(15,23,42,0.04)] hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Buttons */}
              <div className="mt-3 grid gap-2">

                <Link
                  href="/"
                  className="inline-flex w-full items-center gap-2 rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-[0_8px_18px_rgba(15,23,42,0.04)] transition hover:bg-slate-50"
                >
                  <Home className="size-4" />
                  Go Home
                </Link>

                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="inline-flex w-full items-center gap-2 rounded-[1rem] border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 shadow-[0_8px_18px_rgba(15,23,42,0.04)] transition hover:bg-red-50"
                >
                  <LogOut className="size-4" />
                  Logout
                </button>

              </div>

              {/* Bottom Card */}
              <div className="mt-5 overflow-hidden rounded-[1.4rem] bg-[linear-gradient(135deg,#2563eb_0%,#3b82f6_50%,#60a5fa_100%)] p-4 text-white shadow-[0_16px_34px_rgba(37,99,235,0.22)]">

                <div className="flex items-center justify-between gap-3">

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
                      College Portal
                    </p>

                    <h3 className="mt-2 text-[1.15rem] font-bold leading-tight">
                      Manage Your College Smarter
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-white/85">
                      Update courses, manage rankings, and maintain your profile.
                    </p>

                    <button
                      type="button"
                      onClick={() => router.push("/explore")}
                      className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#2563eb] transition hover:scale-[1.03]"
                    >
                      Explore College
                    </button>
                  </div>

                  <div className="hidden sm:flex">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[1rem] bg-white/15 backdrop-blur-md">
                      <LayoutDashboard className="size-8 text-white" />
                    </div>
                  </div>

                </div>
              </div>
            </aside>

            {/* Main */}
            <div className="min-w-0 space-y-3">

              <div className="flex items-center justify-between gap-3">
                <PageBackButton />
              </div>

              <main className="space-y-3">
                {children}
              </main>

            </div>
          </div>
        </div>
      </section>

      {/* Logout Popup */}
      {showLogoutConfirm ? (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">

          <div className="relative w-full max-w-[470px] rounded-[2rem] bg-white px-6 py-6 shadow-[0_20px_60px_rgba(15,23,42,0.18)] animate-in fade-in zoom-in-95 duration-200">

            {/* Close */}
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute right-5 top-5 flex size-8 items-center justify-center rounded-full transition hover:bg-slate-100"
            >
              <X className="size-4 text-slate-500" />
            </button>

            {/* Top */}
            <div className="flex items-center gap-4">

              {/* Avatar */}
              <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2563eb,#60a5fa)] text-2xl font-extrabold text-white shadow-lg">
                {getInitials(currentUser?.name)?.charAt(0) || "C"}
              </div>

              <div>
                <h2 className="text-[2rem] font-extrabold leading-none text-slate-900">
                  Logout
                </h2>

                <p className="mt-2 text-base font-medium text-slate-500">
                  {currentUser?.name || "College User"}
                </p>
              </div>

            </div>

            {/* Description */}
            <p className="mt-7 text-[1rem] leading-7 text-slate-600">
              Are you sure you want to logout from your dashboard account?
            </p>

            {/* Buttons */}
            <div className="mt-8 flex items-center justify-end gap-3">

              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-base font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl bg-[#ff3347] px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-[#eb2237]"
              >
                Logout
              </button>

            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}