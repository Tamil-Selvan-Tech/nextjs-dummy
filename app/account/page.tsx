"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  Home,
  Mail,
  Phone,
  Search,
  UserRound,
  FileText,
  User,
  ChevronRight,
  LogOut,
  X,
  Eye,
} from "lucide-react";

import { useRouter } from "next/navigation";

import {
  clearAuth,
  readAuthToken,
  readCurrentUser,
  type SafeAuthUser,
} from "@/lib/auth-storage";

import { request, withAuth } from "@/lib/api";
import { showToast } from "@/lib/toast";

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
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-24 animate-pulse rounded-[1.5rem] bg-[#edf4ff]"
        />
      ))}
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] =
    useState<SafeAuthUser | null>(null);

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const [selectedEnquiry, setSelectedEnquiry] =
    useState<Enquiry | null>(null);

  const [showAllEnquiries, setShowAllEnquiries] =
    useState(false);

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
          request<AccountUserResponse>(
            "/api/users/me",
            withAuth(storedToken)
          ),

          request<AccountEnquiriesResponse>(
            "/api/users/enquiries",
            withAuth(storedToken)
          ),
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

          window.localStorage.setItem(
            "collegehub_current_user",
            JSON.stringify(safeUser)
          );
        }

        setEnquiries(enquiryData.enquiries || []);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Unable to load account data";

        showToast(message, "error");

        if (
          message.toLowerCase().includes("not authorized")
        ) {
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

  const accountTypeLabel =
    currentUser?.role === "college"
      ? "College"
      : "Student";

  const handleLogout = () => {
    clearAuth();
    setCurrentUser(null);
    router.push("/login");
  };

  const displayedEnquiries = showAllEnquiries
    ? enquiries
    : enquiries.slice(0, 3);

  return (
    <>
      <section className="min-h-screen bg-[linear-gradient(180deg,#f4f8ff_0%,#edf4ff_50%,#f8fbff_100%)] px-4 py-5 text-slate-800">

        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[#dbeafe] bg-white shadow-[0_18px_50px_rgba(37,99,235,0.08)]">

          {/* HEADER */}

         {/* HEADER */}

<header className="relative overflow-hidden rounded-t-[2rem] border-b border-[#dbeafe] bg-white px-4 py-4 lg:px-6">

  <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#dbeafe]/40 blur-3xl" />

  <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[#bfdbfe]/30 blur-3xl" />

  <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

    {/* LEFT */}

    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#2563eb]">
        Student Account
      </p>

      <h1 className="mt-1 text-[1.5rem] font-extrabold leading-none text-[#0f172a]">
        {currentUser?.name || "Hema"}
      </h1>

      <p className="mt-1 text-xs text-slate-500">
        Welcome back! 👋
      </p>
    </div>

    {/* RIGHT */}

    <div className="flex flex-wrap items-center gap-2">

      <button
        onClick={() => router.push("/explore")}
        className="flex h-10 items-center gap-2 rounded-full border border-[#dbeafe] bg-white px-3 text-xs font-semibold text-[#2563eb] shadow-sm transition hover:bg-[#f8fbff]"
      >
        <Search className="size-3.5 text-[#2563eb]" />
        Explore Colleges
      </button>

      <button
        onClick={() => router.push("/")}
        className="flex h-10 items-center gap-2 rounded-full border border-[#dbeafe] bg-white px-3 text-xs font-semibold text-[#2563eb] shadow-sm transition hover:bg-[#f8fbff]"
      >
        <Home className="size-3.5 text-[#2563eb]" />
        Go Home
      </button>

      <button
        onClick={() => setShowLogoutPopup(true)}
        className="flex h-10 items-center gap-2 rounded-full border border-[#ffd6dc] bg-white px-3 text-xs font-bold text-[#ff3355] shadow-sm transition hover:bg-[#fff5f6]"
      >
        <LogOut className="size-3.5" />
        Logout
      </button>

      {/* PROFILE */}

      <div className="flex items-center gap-2 rounded-full border border-[#dbeafe] bg-white px-2 py-1 shadow-sm">

        <div className="flex size-7 items-center justify-center rounded-full bg-[#2563eb] text-[11px] font-extrabold text-white">
          {currentUser?.name
            ?.charAt(0)
            ?.toUpperCase() || "H"}
        </div>

        <ChevronRight className="size-3.5 rotate-90 text-[#2563eb]" />
      </div>
    </div>
  </div>
</header>

          {/* STATS */}

          <div className="grid gap-4 px-5 pt-5 lg:grid-cols-3 lg:px-6">

            <div className="rounded-[1.8rem] border border-[#dbeafe] bg-[linear-gradient(135deg,#f8fbff_0%,#edf4ff_100%)] p-5 shadow-[0_10px_30px_rgba(37,99,235,0.06)]">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#2563eb]">
                    Total Enquiries
                  </p>

                  <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
                    {loading ? "--" : stats.total}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    All enquiries
                  </p>
                </div>

                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#dbeafe]">
                  <FileText className="size-5 text-[#2563eb]" />
                </div>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-[#dbeafe] bg-[linear-gradient(135deg,#f4f8ff_0%,#e0ecff_100%)] p-5 shadow-[0_10px_30px_rgba(37,99,235,0.06)]">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#2563eb]">
                    This Month
                  </p>

                  <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
                    {loading ? "--" : stats.monthly}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Monthly enquiries
                  </p>
                </div>

                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#dbeafe]">
                  <CalendarDays className="size-5 text-[#2563eb]" />
                </div>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-[#dbeafe] bg-[linear-gradient(135deg,#f7fbff_0%,#edf4ff_100%)] p-5 shadow-[0_10px_30px_rgba(37,99,235,0.06)]">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#2563eb]">
                    Account Type
                  </p>

                  <h2 className="mt-3 flex items-center gap-2 text-[1.4rem] font-extrabold text-slate-900">
                    <GraduationCap className="size-5 text-[#2563eb]" />
                    {accountTypeLabel}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Your account type
                  </p>
                </div>

                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#dbeafe]">
                  <User className="size-5 text-[#2563eb]" />
                </div>
              </div>
            </div>
          </div>

          {/* MAIN */}

          <div className="grid gap-5 px-5 py-5 lg:grid-cols-[0.88fr_1.12fr] lg:px-6">

            {/* PROFILE */}

            <section className="rounded-[1.8rem] border border-[#dbeafe] bg-white p-5 shadow-[0_10px_30px_rgba(37,99,235,0.05)]">

              <div className="flex items-center justify-between">

                <h2 className="text-lg font-bold text-slate-900">
                  Profile Details
                </h2>

                <div className="flex size-10 items-center justify-center rounded-2xl bg-[#edf4ff]">
                  <UserRound className="size-5 text-[#2563eb]" />
                </div>
              </div>

              <div className="mt-5 space-y-3">

                <div className="flex items-center gap-3 rounded-[1.3rem] border border-[#e2ecff] bg-[#f8fbff] px-4 py-3.5">

                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#dbeafe]">
                    <UserRound className="size-4 text-[#2563eb]" />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Name
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {currentUser?.name || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-[1.3rem] border border-[#e2ecff] bg-[#f8fbff] px-4 py-3.5">

                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#dbeafe]">
                    <Mail className="size-4 text-[#2563eb]" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Email
                    </p>

                    <p className="mt-1 break-all text-sm text-slate-900">
                      {currentUser?.email || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-[1.3rem] border border-[#e2ecff] bg-[#f8fbff] px-4 py-3.5">

                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#dbeafe]">
                    <Phone className="size-4 text-[#2563eb]" />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Mobile
                    </p>

                    <p className="mt-1 text-sm text-slate-900">
                      {currentUser?.phone || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ENQUIRIES */}

            <section className="rounded-[1.8rem] border border-[#dbeafe] bg-white p-5 shadow-[0_10px_30px_rgba(37,99,235,0.05)]">

              <div className="flex items-center justify-between">

                <h2 className="text-lg font-bold text-slate-900">
                  My Enquiry Activity
                </h2>

                {enquiries.length > 3 && (
                  <button
                    onClick={() =>
                      setShowAllEnquiries(
                        !showAllEnquiries
                      )
                    }
                    className="rounded-xl border border-[#dbeafe] bg-[#f8fbff] px-3 py-2 text-xs font-semibold text-[#2563eb] transition hover:bg-[#edf4ff]"
                  >
                    {showAllEnquiries
                      ? "Show Less"
                      : "View All"}
                  </button>
                )}
              </div>

              {loading ? (
                <div className="mt-5">
                  <AccountSkeleton />
                </div>
              ) : enquiries.length === 0 ? (
                <div className="mt-5 rounded-[1.5rem] border border-dashed border-[#cddfff] bg-[#f8fbff] p-7 text-center text-sm text-slate-500">
                  No enquiries submitted yet.
                </div>
              ) : (
                <div className="mt-5 space-y-3">

                  {displayedEnquiries.map((item) => (

                    <article
                      key={item._id}
                      className="rounded-[1.5rem] border border-[#dbeafe] bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_100%)] p-4 shadow-sm transition hover:-translate-y-0.5"
                    >

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                        <div>
                          <h3 className="text-sm font-bold leading-5 text-slate-900">
                            {item.collegeName || "-"}
                          </h3>

                          <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                            <BookOpen className="size-3.5 text-[#2563eb]" />
                            {item.course || "-"}
                          </p>

                          <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                            <CalendarDays className="size-3.5 text-[#2563eb]" />
                            {item.createdAt
                              ? new Date(
                                  item.createdAt
                                ).toLocaleDateString()
                              : "-"}
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            setSelectedEnquiry(item)
                          }
                          className="flex items-center gap-1 rounded-xl bg-[#2563eb] px-3 py-2 text-[11px] font-bold text-white transition hover:bg-[#1d4ed8]"
                        >
                          <Eye className="size-3.5" />
                          Open
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </section>

      {/* ENQUIRY POPUP */}

      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/50 px-4 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-[2rem] border border-[#dbeafe] bg-white p-6 shadow-[0_25px_60px_rgba(37,99,235,0.18)]">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#2563eb]">
                  Enquiry Details
                </p>

                <h2 className="mt-2 text-xl font-extrabold text-slate-900">
                  {selectedEnquiry.collegeName}
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedEnquiry(null)
                }
                className="flex size-9 items-center justify-center rounded-full bg-[#edf4ff] transition hover:bg-[#dbeafe]"
              >
                <X className="size-4 text-[#2563eb]" />
              </button>
            </div>

            <div className="mt-6 space-y-4">

              <div className="rounded-[1.5rem] border border-[#dbeafe] bg-[#f8fbff] p-4">

                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#2563eb]">
                  Course
                </p>

                <p className="mt-3 text-sm font-semibold text-slate-800">
                  {selectedEnquiry.course || "-"}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-[#dbeafe] bg-[#f8fbff] p-4">

                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#2563eb]">
                  Date
                </p>

                <p className="mt-3 text-sm font-semibold text-slate-800">
                  {selectedEnquiry.createdAt
                    ? new Date(
                        selectedEnquiry.createdAt
                      ).toLocaleDateString()
                    : "-"}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-[#dbeafe] bg-[linear-gradient(135deg,#f8fbff_0%,#edf4ff_100%)] p-4">

                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#2563eb]">
                  Student Message
                </p>

                <p className="mt-3 text-sm leading-7 text-slate-700">
                  {selectedEnquiry.message ||
                    "The student has submitted an enquiry regarding admission details, eligibility, placements, and fee structure."}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">

              <button
                onClick={() =>
                  setSelectedEnquiry(null)
                }
                className="rounded-xl bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT POPUP */}

      {showLogoutPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/50 px-4 backdrop-blur-sm">

          <div className="relative w-full max-w-[380px] rounded-[1.8rem] border border-[#dbeafe] bg-white p-6 shadow-[0_25px_60px_rgba(37,99,235,0.18)]">

            <button
              onClick={() =>
                setShowLogoutPopup(false)
              }
              className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-[#edf4ff] transition hover:bg-[#dbeafe]"
            >
              <X className="size-4 text-[#2563eb]" />
            </button>

            <div className="flex items-center gap-4">

              <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f4c81_0%,#2563eb_100%)] text-xl font-extrabold text-white shadow-lg">
                {currentUser?.name
                  ?.charAt(0)
                  ?.toUpperCase() || "H"}
              </div>

              <div>
                <h2 className="text-[1.6rem] font-extrabold text-slate-900">
                  Logout
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {currentUser?.name || "Hema"}
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-600">
              Are you sure you want to logout from
              your account?
            </p>

            <div className="mt-7 flex items-center justify-end gap-3">

              <button
                onClick={() =>
                  setShowLogoutPopup(false)
                }
                className="rounded-2xl border border-[#dbeafe] bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-[#f8fbff]"
              >
                Cancel
              </button>

              <button
  onClick={handleLogout}
  className="rounded-2xl bg-[#ef4444] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#dc2626]"
>
  Logout
</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}