"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, MessageSquareText, Phone, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { CollegePortalShell } from "@/components/college-portal-shell";
import {
  clearAuth,
  readAuthToken,
  readCurrentUser,
  type SafeAuthUser,
} from "@/lib/auth-storage";
import { request, withAuth } from "@/lib/api";

type CollegeEnquiry = {
  _id: string;
  collegeName?: string;
  name?: string;
  email?: string;
  phone?: string;
  course?: string;
  message?: string;
  status?: "pending" | "contacted" | "closed";
  createdAt?: string;
};

export default function CollegeEnquiriesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SafeAuthUser | null>(null);
  const [enquiries, setEnquiries] = useState<CollegeEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ type: "error"; text: string } | null>(null);

  useEffect(() => {
    const storedToken = readAuthToken();
    const storedUser = readCurrentUser();

    if (!storedToken || !storedUser) {
      router.replace("/login?type=college&redirect=/college/enquiries");
      return;
    }
    if (storedUser.role !== "college") {
      router.replace("/account");
      return;
    }

    setCurrentUser(storedUser);

    const loadEnquiries = async () => {
      try {
        setLoading(true);
        const data = await request("/api/users/college-enquiries", withAuth(storedToken));
        setEnquiries((data.enquiries as CollegeEnquiry[]) || []);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load enquiries";
        setStatus({ type: "error", text: message });
        if (message.toLowerCase().includes("not authorized")) {
          clearAuth();
          router.replace("/login?type=college");
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    loadEnquiries();
  }, [router]);

  const counts = useMemo(() => {
    const pending = enquiries.filter((item) => item.status === "pending").length;
    const contacted = enquiries.filter((item) => item.status === "contacted").length;
    const closed = enquiries.filter((item) => item.status === "closed").length;
    return { total: enquiries.length, pending, contacted, closed };
  }, [enquiries]);

  const tone = (value?: string) =>
    value === "contacted"
      ? "border-sky-200 bg-sky-50 text-sky-700"
      : value === "closed"
        ? "border-slate-200 bg-slate-100 text-slate-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <CollegePortalShell
      title="Student Enquiries"
      subtitle="Review incoming leads from prospective students in a clean, readable feed that works smoothly across mobile, tablet, and desktop."
      currentUser={currentUser}
    >
      {status ? (
        <div className="rounded-[1.4rem] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {status.text}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total", value: counts.total },
          { label: "Pending", value: counts.pending },
          { label: "Contacted", value: counts.contacted },
          { label: "Closed", value: counts.closed },
        ].map((item) => (
          <article key={item.label} className="luxe-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-extrabold text-[color:var(--text-dark)]">
              {loading ? "--" : item.value}
            </p>
          </article>
        ))}
      </div>

      <section className="luxe-card p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-primary)]">
              Lead Feed
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[color:var(--text-dark)]">
              Recent student messages
            </h2>
          </div>
          <span className="rounded-full border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.04)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">
            {loading ? "--" : `${enquiries.length} enquiries`}
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {enquiries.map((item) => (
            <article key={item._id} className="rounded-[1.4rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.03)] p-4 sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold text-[color:var(--text-dark)]">
                      {item.name || "Student enquiry"}
                    </h3>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${tone(item.status)}`}>
                      {item.status || "pending"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}
                  </p>
                </div>
                <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--brand-primary)]">
                  {item.course || "Course not specified"}
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2 xl:grid-cols-3">
                <p className="inline-flex items-center gap-2">
                  <UserRound className="size-4 text-slate-500" />
                  {item.name || "-"}
                </p>
                <p className="inline-flex items-center gap-2">
                  <Mail className="size-4 text-slate-500" />
                  {item.email || "-"}
                </p>
                <p className="inline-flex items-center gap-2">
                  <Phone className="size-4 text-slate-500" />
                  {item.phone || "-"}
                </p>
              </div>

              <div className="mt-4 rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white px-4 py-3">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--text-dark)]">
                  <MessageSquareText className="size-4 text-[color:var(--brand-primary)]" />
                  Message
                </p>
                <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">
                  {item.message || "No message shared by the student."}
                </p>
              </div>
            </article>
          ))}

          {!loading && enquiries.length === 0 ? (
            <div className="rounded-[1.4rem] border border-dashed border-[rgba(15,76,129,0.14)] bg-white px-4 py-10 text-center text-sm text-[color:var(--text-muted)]">
              No student enquiries yet. Once students submit forms for your college, they will appear here.
            </div>
          ) : null}
        </div>
      </section>
    </CollegePortalShell>
  );
}
