"use client";

import { FileStack, Home, LayoutDashboard, LogOut, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
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
  { href: "/college/requests", label: "Requests", icon: FileStack },
];

export function CollegePortalShell({
  title,
  subtitle,
  currentUser,
  actions,
  children,
}: PortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push("/login?type=college");
  };

  return (
    <section className="section-shell min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f9fcff_0%,#eff7fc_100%)] text-[color:var(--text-dark)]">
      <div className="mesh-bg opacity-65" />
      <div className="hero-grid absolute inset-0 opacity-[0.05]" />

      <div className="page-container relative z-10 py-3 sm:py-5">
        <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1240px] gap-3 lg:grid-cols-[232px_1fr] xl:grid-cols-[244px_1fr]">
          <aside className="glass-panel reveal-up rounded-[1.35rem] border border-white/35 bg-[linear-gradient(180deg,rgba(15,76,129,0.94),rgba(18,54,112,0.97))] p-3.5 text-white shadow-[0_22px_48px_rgba(6,18,38,0.2)] sm:p-4 lg:sticky lg:top-5 lg:self-start">
            <div className="flex items-center justify-between gap-3">
              <BrandLogo className="h-10" />
              <span className="inline-flex items-center rounded-full border border-white/25 bg-white p-1.5 text-slate-900">
                <ShieldCheck className="size-3.5" />
              </span>
            </div>

            <div className="mt-5 rounded-[1.05rem] border border-white/12 bg-white/10 p-3 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-900">
                Signed In As
              </p>
              <div className="mt-3 grid gap-2">
                <div className="flex min-w-0 items-center gap-2 rounded-[0.9rem] border border-white/25 bg-white px-2.5 py-2 text-[12px] shadow-[0_8px_18px_rgba(9,24,43,0.08)]">
                  <UserRound className="size-3.5 shrink-0 text-slate-500" />
                  <span className="min-w-0 flex-1 truncate font-semibold text-slate-900">
                    {currentUser?.name || "College User"}
                  </span>
                </div>
                <div className="flex min-w-0 items-center gap-2 rounded-[0.9rem] border border-white/25 bg-white px-2.5 py-2 text-[12px] shadow-[0_8px_18px_rgba(9,24,43,0.08)]">
                  <Mail className="size-3.5 shrink-0 text-slate-500" />
                  <span className="min-w-0 flex-1 truncate text-slate-900">{currentUser?.email || "-"}</span>
                </div>
                <div className="flex min-w-0 items-center gap-2 rounded-[0.9rem] border border-white/25 bg-white px-2.5 py-2 text-[12px] shadow-[0_8px_18px_rgba(9,24,43,0.08)]">
                  <Phone className="size-3.5 shrink-0 text-slate-500" />
                  <span className="min-w-0 flex-1 truncate text-slate-900">
                    {currentUser?.phone || "No phone added"}
                  </span>
                </div>
              </div>
            </div>

            <nav className="mt-5 space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  (item.href !== "/college-dashboard" && pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-[0.95rem] px-3.5 py-2.5 text-[13px] font-semibold transition ${
                      active
                        ? "bg-white text-slate-900 shadow-[0_12px_24px_rgba(0,0,0,0.12)]"
                        : "text-slate-900 bg-white hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="size-4.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <Link
              href="/"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[0.95rem] border border-white/25 bg-white px-3.5 py-2.5 text-[13px] font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              <Home className="size-4" />
              Go Home
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[0.95rem] border border-white/25 bg-white px-3.5 py-2.5 text-[13px] font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </aside>

          <div className="space-y-3">
            <div>
              <PageBackButton />
            </div>
            <header className="reveal-up delay-1 rounded-[1.35rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(248,251,255,0.95))] p-3.5 shadow-[0_18px_40px_rgba(11,28,46,0.08)] sm:p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="editorial-kicker text-[11px] text-[color:var(--brand-primary)]">
                    <span className="h-2 w-2 rounded-full bg-[color:var(--brand-accent)]" />
                    College Workspace
                  </p>
                  <h1 className="mt-2.5 font-[family:var(--font-display)] text-xl font-bold leading-tight text-slate-900 sm:text-2xl xl:text-[2rem]">
                    {title}
                  </h1>
                  <p className="mt-2 max-w-xl text-[13px] leading-5 text-slate-600">
                    {subtitle}
                  </p>
                </div>
                {actions ? <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end lg:max-w-[48%]">{actions}</div> : null}
              </div>
            </header>

            <main className="space-y-3">{children}</main>
          </div>
        </div>
      </div>
    </section>
  );
}
