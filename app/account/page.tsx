"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  GraduationCap,
  LogOut,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { PageBackButton } from "@/components/global-back-button";
import {
  clearAuth,
  readAuthToken,
  readCurrentUser,
  type SafeAuthUser,
} from "@/lib/auth-storage";
import { request, withAuth } from "@/lib/api";

type Enquiry = {
  _id: string;
  collegeName?: string;
  course?: string;
  message?: string;
  createdAt?: string;
};

type AccountUserResponse = {
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
  };
};

type AccountEnquiriesResponse = {
  enquiries?: Enquiry[];
};

function AccountSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`account-enquiry-skeleton-${index}`}
          className="rounded-[1.2rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.04)] p-4"
        >
          <div className="h-5 w-1/3 rounded bg-[rgba(15,76,129,0.1)]" />
          <div className="mt-2 h-4 w-1/2 rounded bg-[rgba(15,76,129,0.08)]" />
          <div className="mt-3 h-4 w-full rounded bg-[rgba(15,76,129,0.06)]" />
        </div>
      ))}
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SafeAuthUser | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedToken = readAuthToken();
    const storedUser = readCurrentUser();

    if (!storedToken) {
      router.replace("/login?redirect=/account");
      return;
    }

    if (storedUser?.role === "admin") {
      router.replace("/admin");
      return;
    }

    setCurrentUser(storedUser);

    const loadAccount = async () => {
      try {
        setLoading(true);

        const [meData, enquiryData] = await Promise.all([
          request<AccountUserResponse>("/api/users/me", withAuth(storedToken)),
          request<AccountEnquiriesResponse>("/api/users/enquiries", withAuth(storedToken)),
        ]);

        const user = meData.user;

        if (user) {
          const safeUser: SafeAuthUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
          };
          setCurrentUser(safeUser);
          window.localStorage.setItem("collegehub_current_user", JSON.stringify(safeUser));
        }

        setEnquiries((enquiryData.enquiries || []).slice(0, 8));
        setError("");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load account data";
        setError(message);
        if (message.toLowerCase().includes("not authorized")) {
          clearAuth();
          router.replace("/login?redirect=/account");
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    loadAccount();
  }, [router]);

  const stats = useMemo(() => {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthly = enquiries.filter((item) => {
      const date = new Date(item.createdAt || "");
      return (
        Number.isFinite(date.getTime()) &&
        date.getMonth() === thisMonth &&
        date.getFullYear() === thisYear
      );
    }).length;

    return {
      total: enquiries.length,
      monthly,
    };
  }, [enquiries]);

  const accountTypeLabel = currentUser?.role === "college" ? "College" : "Student";

  const handleLogout = () => {
    clearAuth();
    setCurrentUser(null);
    router.push("/login");
  };

  return (
    <section className="section-shell min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef6fc_100%)] py-4 text-slate-800 sm:py-5">
      <div className="page-container relative z-10">
        <div className="mb-3">
          <PageBackButton />
        </div>
        <div className="mx-auto overflow-hidden rounded-[2rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,251,255,0.96))] shadow-[0_28px_70px_rgba(22,50,79,0.12)]">
          <header className="flex flex-col gap-4 border-b border-[rgba(15,76,129,0.08)] p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <BrandLogo className="h-10" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-primary)]">
                  {accountTypeLabel} Account
                </p>
                <h1 className="text-xl font-bold text-[color:var(--text-dark)]">
                  {currentUser?.name || "My Account"}
                </h1>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push("/explore")}
                className="rounded-full border border-[rgba(15,76,129,0.12)] bg-white px-4 py-2.5 text-sm font-semibold text-[color:var(--brand-primary)] transition hover:bg-[rgba(15,76,129,0.04)]"
              >
                Explore Colleges
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)]"
              >
                <LogOut className="size-4" />
                Logout
              </button>
            </div>
          </header>

          <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-3">
            <div className="luxe-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Total Enquiries
              </p>
              <p className="mt-2 text-3xl font-extrabold text-[color:var(--text-dark)]">
                {loading ? "--" : stats.total}
              </p>
            </div>
            <div className="luxe-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                This Month
              </p>
              <p className="mt-2 text-3xl font-extrabold text-[color:var(--text-dark)]">
                {loading ? "--" : stats.monthly}
              </p>
            </div>
            <div className="luxe-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Account Type
              </p>
              <p className="mt-2 inline-flex items-center gap-2 text-lg font-bold text-[color:var(--brand-primary)]">
                <GraduationCap className="size-5" />
                {accountTypeLabel}
              </p>
            </div>
          </div>

          <div className="grid gap-5 px-5 pb-8 sm:px-6 lg:grid-cols-[0.82fr_1.18fr]">
            <section className="luxe-card flex h-full min-h-[20.5rem] flex-col p-3 sm:p-3.5">
              <h2 className="text-base font-bold text-[color:var(--text-dark)]">Profile Details</h2>
              <div className="mt-3.5 space-y-2">
                <div className="rounded-[0.95rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.03)] px-3 py-2">
                  <div className="grid grid-cols-[1.15rem_4.2rem_1fr] items-start gap-2.5 text-[13px]">
                    <UserRound className="mt-0.5 size-4 text-slate-500" />
                    <span className="font-semibold text-slate-500">Name</span>
                    <span className="break-words font-semibold text-[color:var(--text-dark)]">
                      {currentUser?.name || "-"}
                    </span>
                  </div>
                </div>
                <div className="rounded-[0.95rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.03)] px-3 py-2">
                  <div className="grid grid-cols-[1.15rem_4.2rem_1fr] items-start gap-2.5 text-[13px]">
                    <Mail className="mt-0.5 size-4 text-slate-500" />
                    <span className="font-semibold text-slate-500">Email</span>
                    <span className="break-all text-[color:var(--text-dark)]">
                      {currentUser?.email || "-"}
                    </span>
                  </div>
                </div>
                <div className="rounded-[0.95rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.03)] px-3 py-2">
                  <div className="grid grid-cols-[1.15rem_4.2rem_1fr] items-start gap-2.5 text-[13px]">
                    <Phone className="mt-0.5 size-4 text-slate-500" />
                    <span className="font-semibold text-slate-500">Mobile</span>
                    <span className="break-words text-[color:var(--text-dark)]">
                      {currentUser?.phone || "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => router.push("/explore")}
                  className="flex w-full items-center justify-between rounded-[0.9rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 py-2 text-[13px] font-semibold text-[color:var(--brand-primary)] transition hover:bg-[rgba(15,76,129,0.04)]"
                >
                  Browse Top Colleges
                  <ArrowRight className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/about-us")}
                  className="flex w-full items-center justify-between rounded-[0.9rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 py-2 text-[13px] font-semibold text-[color:var(--brand-primary)] transition hover:bg-[rgba(15,76,129,0.04)]"
                >
                  About Platform
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </section>

            <section className="luxe-card flex h-full min-h-[20.5rem] flex-col p-3.5 sm:p-4">
              <h2 className="text-base font-bold text-[color:var(--text-dark)]">My Enquiry Activity</h2>

              {error ? (
                <div className="mt-3.5 rounded-[0.95rem] border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {loading ? (
                <div className="mt-3.5 flex-1">
                  <AccountSkeleton />
                </div>
              ) : enquiries.length === 0 ? (
                <div className="mt-3.5 flex-1 rounded-[0.95rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.04)] p-3 text-sm text-slate-600">
                  No enquiries submitted yet. Start exploring colleges and send your
                  first enquiry.
                </div>
              ) : (
                <div className="mt-3.5 flex-1 space-y-2.5 overflow-y-auto pr-1 lg:max-h-[16rem]">
                  {enquiries.map((item) => (
                    <article
                      key={item._id}
                      className="rounded-[0.95rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.04)] p-3"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-bold text-[color:var(--text-dark)]">
                            {item.collegeName || "-"}
                          </p>
                          <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                            <BookOpen className="size-3.5" />
                            {item.course || "-"}
                          </p>
                        </div>
                        <p className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <CalendarDays className="size-3.5" />
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{item.message || "-"}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          <footer className="border-t border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.03)] px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--brand-primary)] transition hover:bg-[rgba(15,76,129,0.04)]"
            >
              <ArrowRight className="size-4 rotate-180" />
              Go Home
            </button>
          </footer>
        </div>
      </div>
    </section>
  );
}
