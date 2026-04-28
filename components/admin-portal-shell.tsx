"use client";

import { useState, useEffect } from "react";
import {
  Home,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { PageBackButton } from "@/components/global-back-button";
import { clearAuth, type SafeAuthUser } from "@/lib/auth-storage";

type AdminNavItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type AdminPortalShellProps = {
  currentUser: (SafeAuthUser & { isSuperAdmin?: boolean }) | null;
  navItems: AdminNavItem[];
  activeTab: string;
  onChangeTab: (id: string) => void;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
};

export function AdminPortalShell({
  currentUser,
  navItems,
  activeTab,
  onChangeTab,
  title,
  subtitle,
  actions,
  headerActions,
  children,
}: AdminPortalShellProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    router.push("/login?type=admin");
  };

  // Close sidebar when clicking on a nav item
  const handleNavClick = (id: string) => {
    onChangeTab(id);
    setSidebarOpen(false);
  };

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <section className="section-shell min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_20%),radial-gradient(circle_at_top_right,rgba(125,211,252,0.18),transparent_24%),linear-gradient(180deg,#fffdf8_0%,#f8fbff_54%,#f3f8ff_100%)] text-[color:var(--text-dark)]">
      <div className="mesh-bg opacity-20" />
      <div className="hero-grid absolute inset-0 opacity-[0.05]" />
      <div className="absolute left-[-4rem] top-10 h-52 w-52 rounded-full bg-[rgba(251,191,36,0.12)] blur-3xl" />
      <div className="absolute right-[4%] top-8 h-44 w-44 rounded-full bg-[rgba(125,211,252,0.14)] blur-3xl" />

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="page-container-full relative z-10 px-2 py-2 sm:px-3 sm:py-4">
        <div className="grid min-h-0 gap-2.5 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
          {/* Sidebar - Desktop visible, Mobile hidden unless opened */}
          <aside
            className={`fixed left-0 top-0 z-50 h-screen w-64 transform rounded-none border-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,248,239,0.96))] p-3 text-[color:var(--text-dark)] shadow-[0_24px_50px_rgba(148,163,184,0.18)] backdrop-blur-sm transition-transform duration-300 ease-in-out lg:relative lg:top-0 lg:h-auto lg:w-auto lg:transform-none lg:rounded-[1.55rem] lg:border lg:border-[rgba(148,163,184,0.18)] ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            }`}
          >
            {/* Close button for mobile */}
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-3 rounded-full p-1 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <X className="size-5" />
            </button>

            <div className="space-y-1.5 pt-6 lg:pt-0">
              <BrandLogo className="h-10" />
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(251,191,36,0.2)] bg-[linear-gradient(135deg,rgba(255,251,235,0.98),rgba(255,255,255,0.95))] px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#9a6700] shadow-[0_8px_20px_rgba(251,191,36,0.14)]">
                <ShieldCheck className="size-3.5 text-[#d97706]" />
                Admin Panel
              </span>
            </div>

            <div className="mt-3 rounded-[1.2rem] border border-[rgba(148,163,184,0.15)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,250,255,0.92))] p-3 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(56,189,248,0.18)] bg-[rgba(224,242,254,0.9)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#0f4c81]">
                <Sparkles className="size-3.5 text-[#0284c7]" />
                {currentUser?.isSuperAdmin ? "Super Admin" : "Admin"}
              </div>

              <div className="mt-3 space-y-2.5">
                <div className="flex items-start gap-2.5 text-xs sm:text-sm">
                  <UserRound className="mt-0.5 size-4 shrink-0 text-[color:var(--brand-primary)]" />
                  <span className="min-w-0 break-words font-semibold text-slate-900">
                    {currentUser?.name || "Admin"}
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm">
                  <Mail className="mt-0.5 size-4 shrink-0 text-[color:var(--brand-primary)]" />
                  <span className="min-w-0 break-all whitespace-normal text-slate-700">
                    {currentUser?.email || "-"}
                  </span>
                </div>
              </div>
            </div>

            <nav className="mt-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`flex w-full items-start gap-2.5 rounded-[1.05rem] px-3 py-2.5 text-left text-xs font-semibold transition duration-200 sm:text-sm ${
                      active
                        ? "border border-[rgba(56,189,248,0.18)] bg-[linear-gradient(135deg,#ffffff_0%,#eff8ff_100%)] text-[#0f4c81] shadow-[0_14px_28px_rgba(56,189,248,0.12)]"
                        : "border border-transparent text-slate-600 hover:border-[rgba(148,163,184,0.16)] hover:bg-[rgba(255,255,255,0.78)] hover:text-[#0f4c81]"
                    }`}
                  >
                    <Icon className={`mt-0.5 size-4.5 shrink-0 ${active ? "text-[#0284c7]" : "text-slate-400"}`} />
                    <span className="whitespace-normal break-words leading-5">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="min-h-0 overflow-visible pr-0 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
            <div className="space-y-3 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-[1.25rem] border border-white/60 bg-white/70 px-3 py-3 shadow-[0_16px_32px_rgba(148,163,184,0.12)] backdrop-blur-sm sm:px-3.5">
                <div className="flex items-center gap-2">
                  {/* Mobile menu button */}
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="rounded-full p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                  >
                    <Menu className="size-5" />
                  </button>
                  <PageBackButton />
                </div>

                <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
                  {headerActions}
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-1 rounded-[1rem] border border-[rgba(56,189,248,0.18)] bg-white px-2.5 py-2 text-[10px] font-semibold text-slate-700 transition hover:border-[rgba(56,189,248,0.28)] hover:bg-sky-50 sm:gap-2 sm:px-4 sm:text-xs lg:text-sm"
                  >
                    <Home className="size-3.5 sm:size-4" />
                    <span className="hidden sm:inline">Go Home</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center gap-1 rounded-[1rem] border border-[rgba(251,191,36,0.22)] bg-[linear-gradient(135deg,#fff8e7_0%,#fff3d6_100%)] px-2.5 py-2 text-[10px] font-semibold text-[#9a6700] transition hover:bg-[linear-gradient(135deg,#fff4d6_0%,#ffedbf_100%)] sm:gap-2 sm:px-4 sm:text-xs lg:text-sm"
                  >
                    <LogOut className="size-3.5 sm:size-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </div>

              {(title || subtitle || actions) ? (
                <section className="rounded-[1.5rem] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(247,250,255,0.95))] p-3 shadow-[0_24px_48px_rgba(148,163,184,0.14)] backdrop-blur-sm sm:p-4 md:p-5">
                  <div className="flex flex-col gap-3 md:gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      {title ? (
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-2xl">
                          {title}
                        </h1>
                      ) : null}
                      {subtitle ? (
                        <p className="mt-1 max-w-3xl text-xs leading-6 text-slate-600 sm:mt-2 sm:text-sm">
                          {subtitle}
                        </p>
                      ) : null}
                    </div>
                    {actions ? (
                      <div className="shrink-0 w-full sm:w-auto">{actions}</div>
                    ) : null}
                  </div>
                </section>
              ) : null}

              <main className="space-y-3 pb-4 sm:pb-0">{children}</main>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
