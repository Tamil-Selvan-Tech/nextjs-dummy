"use client";

import type { ComponentType, Dispatch, SetStateAction } from "react";

type OverviewStat = {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  helper: string;
  accent: string;
  cardClass: string;
  iconWrapClass: string;
  accentClass: string;
  glowClass: string;
};

type OverviewCollegeRow = {
  _id: string;
  name?: string;
  contactEmail?: string;
  ownerEmail?: string;
  lastDashboardEditAt?: string;
};

type OverviewSectionProps = {
  token: string;
  stats: OverviewStat[];
  collegeDashboardEditStatus: {
    edited: OverviewCollegeRow[];
    notEdited: OverviewCollegeRow[];
  };
  openCollegeEditReminderConfirm: () => void;
  editedCollegesPage: number;
  editedCollegesPageStart: number;
  editedCollegesPageEnd: number;
  editedCollegesTotalPages: number;
  visibleEditedColleges: OverviewCollegeRow[];
  editedCollegesPaginationItems: Array<number | string>;
  setEditedCollegesPage: Dispatch<SetStateAction<number>>;
  pendingCollegesPage: number;
  pendingCollegesPageStart: number;
  pendingCollegesPageEnd: number;
  pendingCollegesTotalPages: number;
  visiblePendingColleges: OverviewCollegeRow[];
  pendingCollegesPaginationItems: Array<number | string>;
  setPendingCollegesPage: Dispatch<SetStateAction<number>>;
};

export function AdminOverviewSection({
  token,
  stats,
  collegeDashboardEditStatus,
  openCollegeEditReminderConfirm,
  editedCollegesPage,
  editedCollegesPageStart,
  editedCollegesPageEnd,
  editedCollegesTotalPages,
  visibleEditedColleges,
  editedCollegesPaginationItems,
  setEditedCollegesPage,
  pendingCollegesPage,
  pendingCollegesPageStart,
  pendingCollegesPageEnd,
  pendingCollegesTotalPages,
  visiblePendingColleges,
  pendingCollegesPaginationItems,
  setPendingCollegesPage,
}: OverviewSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.label}
              className={`group relative overflow-hidden rounded-[1rem] border p-3.5 shadow-[0_14px_28px_rgba(148,163,184,0.12)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(148,163,184,0.16)] ${item.cardClass}`}
            >
              <div className={`pointer-events-none absolute inset-0 ${item.glowClass}`} />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${item.accentClass}`}>
                    {item.accent}
                  </span>
                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {item.label}
                  </p>
                </div>
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.iconWrapClass}`}>
                  <Icon className="size-4" />
                </span>
              </div>
              <div className="relative mt-4 flex items-end justify-between gap-2">
                <p className="text-[2.2rem] font-bold leading-none text-slate-900 md:text-[2.35rem]">{item.value}</p>
              </div>
              <div className="relative mt-3 flex items-center justify-between gap-2 border-t border-white/70 pt-2.5">
                <p className="text-xs text-slate-600">{item.helper}</p>
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_5px_rgba(74,222,128,0.14)]" />
              </div>
            </article>
          );
        })}
      </div>

      <article className="rounded-[1.6rem] border border-[rgba(15,76,129,0.1)] bg-white p-5 shadow-[0_20px_40px_rgba(148,163,184,0.1)]">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">
              College Edit Status
            </p>
          </div>
          <button
            type="button"
            onClick={openCollegeEditReminderConfirm}
            disabled={!token || collegeDashboardEditStatus.notEdited.length === 0}
            className="inline-flex h-9 w-full items-center justify-center gap-1 rounded-full border border-[rgba(37,99,235,0.3)] bg-[#3b82f6] px-4 text-sm font-bold text-white shadow-[0_10px_20px_rgba(37,99,235,0.16)] transition duration-200 hover:border-[rgba(37,99,235,0.34)] hover:bg-white hover:text-[#2563eb] disabled:cursor-not-allowed disabled:opacity-60 sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2.5"
          >
            Send Mail
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <div className="overflow-hidden rounded-[0.65rem] border border-[#c7d2fe] bg-[#fbfdff] shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-3 border-b border-[#c7d2fe] bg-[#eef2ff] px-3 py-2.5">
              <p className="text-[13px] font-bold text-[#3730a3]">Edited Colleges</p>
              <span className="rounded-md bg-white px-3 py-1 text-[12px] font-bold text-[#4338ca]">
                {collegeDashboardEditStatus.edited.length}
              </span>
            </div>
            {collegeDashboardEditStatus.edited.length > 0 ? (
              <>
                <div className="admin-users-table-scroll overflow-x-auto pb-2">
                  <table className="w-full min-w-[860px] table-fixed text-left text-[13px] text-[#40557a]">
                    <colgroup>
                      <col className="w-[38%]" />
                      <col className="w-[42%]" />
                      <col className="w-[20%]" />
                    </colgroup>
                    <thead className="border-b border-[#c7d2fe] bg-[linear-gradient(90deg,#eef2ff_0%,#f8fbff_52%,#eef2ff_100%)] text-[11px] font-bold uppercase">
                      <tr>
                        {[
                          { label: "College", tone: "bg-white text-[#3730a3]" },
                          { label: "Email", tone: "bg-[#eef8ff] text-[#1d4ed8]" },
                          { label: "Last Edit", tone: "bg-[#f5f3ff] text-[#6d28d9]" },
                        ].map((column) => (
                          <th key={column.label} className="px-4 py-2 text-left">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 ${column.tone}`}>
                              {column.label}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dbe3ee]">
                      {visibleEditedColleges.map((college) => (
                        <tr key={`edited-college-${college._id}`} className="bg-white align-middle transition hover:bg-[#f8fbff]">
                          <td className="truncate px-4 py-2.5 font-bold leading-5 text-[#1e1b4b]">{college.name || "College"}</td>
                          <td className="truncate px-4 py-2.5 font-medium leading-5 text-[#40557a]">{college.contactEmail || college.ownerEmail || "-"}</td>
                          <td className="truncate px-4 py-2.5 font-medium leading-5 text-[#4338ca]">
                            {college.lastDashboardEditAt
                              ? new Date(college.lastDashboardEditAt).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-col gap-3 border-t border-[#c7d2fe] bg-white px-4 py-2.5 text-[12px] font-medium text-[#40557a] sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    Showing {editedCollegesPageStart} to {editedCollegesPageEnd} of {collegeDashboardEditStatus.edited.length} colleges
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditedCollegesPage((current) => Math.max(1, current - 1))}
                      disabled={editedCollegesPage === 1}
                      className="rounded-md border border-[#c7d2fe] bg-white px-4 py-1.5 text-xs font-bold text-[#3730a3] transition hover:bg-[#eef2ff] disabled:cursor-not-allowed disabled:text-[#b9c3d2]"
                    >
                      Previous
                    </button>
                    {editedCollegesPaginationItems.map((item) =>
                      typeof item === "number" ? (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setEditedCollegesPage(item)}
                          className={`h-8 min-w-8 rounded-md px-3 text-xs font-bold transition ${
                            editedCollegesPage === item
                              ? "bg-[#eef2ff] text-[#4338ca]"
                              : "bg-white text-[#40557a] hover:bg-[#f8fafc]"
                          }`}
                        >
                          {item}
                        </button>
                      ) : (
                        <span key={item} className="px-2 text-xs font-bold text-[#40557a]">
                          ...
                        </span>
                      ),
                    )}
                    <button
                      type="button"
                      onClick={() => setEditedCollegesPage((current) => Math.min(editedCollegesTotalPages, current + 1))}
                      disabled={editedCollegesPage === editedCollegesTotalPages}
                      className="rounded-md border border-[#c7d2fe] bg-white px-4 py-1.5 text-xs font-bold text-[#3730a3] transition hover:bg-[#eef2ff] disabled:cursor-not-allowed disabled:text-[#b9c3d2]"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white px-4 py-6 text-sm font-semibold text-[#60708f]">
                No colleges have updated their dashboard yet.
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-[0.65rem] border border-[#fecdd3] bg-[#fffafa] shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-3 border-b border-[#fecdd3] bg-[#fff1f2] px-3 py-2.5">
              <p className="text-[13px] font-bold text-[#be123c]">Pending Colleges</p>
              <span className="rounded-md bg-white px-3 py-1 text-[12px] font-bold text-[#e11d48]">
                {collegeDashboardEditStatus.notEdited.length}
              </span>
            </div>
            {collegeDashboardEditStatus.notEdited.length > 0 ? (
              <div className="bg-white">
                <div className="space-y-3 p-3 sm:hidden">
                  {visiblePendingColleges.map((college) => (
                    <div
                      key={`pending-college-mobile-${college._id}`}
                      className="rounded-md border border-[#fecdd3] bg-[#fffafa] p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-[#881337]">{college.name || "College"}</p>
                          <p className="mt-1 break-all text-xs font-medium text-[#7f5060]">
                            {college.contactEmail || college.ownerEmail || "-"}
                          </p>
                        </div>
                        <span className="inline-flex shrink-0 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600">
                          Pending
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="admin-users-table-scroll hidden overflow-x-auto pb-2 sm:block">
                  <table className="w-full min-w-[860px] table-fixed text-left text-[13px] text-[#40557a]">
                    <colgroup>
                      <col className="w-[38%]" />
                      <col className="w-[42%]" />
                      <col className="w-[20%]" />
                    </colgroup>
                    <thead className="border-b border-[#fecdd3] bg-[linear-gradient(90deg,#fff1f2_0%,#fffafa_52%,#fff7ed_100%)] text-[11px] font-bold uppercase">
                      <tr>
                        {[
                          { label: "College", tone: "bg-white text-[#be123c]" },
                          { label: "Email", tone: "bg-[#fff1f2] text-[#e11d48]" },
                          { label: "Status", tone: "bg-[#fff7ed] text-[#b45309]" },
                        ].map((column) => (
                          <th key={column.label} className="px-4 py-2 text-left">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 ${column.tone}`}>
                              {column.label}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dbe3ee]">
                      {visiblePendingColleges.map((college) => (
                        <tr key={`pending-college-${college._id}`} className="bg-white align-middle transition hover:bg-[#fffafa]">
                          <td className="truncate px-4 py-2.5 font-bold leading-5 text-[#881337]">{college.name || "College"}</td>
                          <td className="truncate px-4 py-2.5 font-medium leading-5 text-[#7f5060]">{college.contactEmail || college.ownerEmail || "-"}</td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <span className="inline-flex min-w-[4.8rem] items-center justify-center whitespace-nowrap rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-600">
                              Pending
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-col gap-3 border-t border-[#fecdd3] bg-white px-4 py-2.5 text-[12px] font-medium text-[#7f5060] sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    Showing {pendingCollegesPageStart} to {pendingCollegesPageEnd} of {collegeDashboardEditStatus.notEdited.length} colleges
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPendingCollegesPage((current) => Math.max(1, current - 1))}
                      disabled={pendingCollegesPage === 1}
                      className="rounded-md border border-[#fecdd3] bg-white px-4 py-1.5 text-xs font-bold text-[#be123c] transition hover:bg-[#fff1f2] disabled:cursor-not-allowed disabled:text-[#b9c3d2]"
                    >
                      Previous
                    </button>
                    {pendingCollegesPaginationItems.map((item) =>
                      typeof item === "number" ? (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setPendingCollegesPage(item)}
                          className={`h-8 min-w-8 rounded-md px-3 text-xs font-bold transition ${
                            pendingCollegesPage === item
                              ? "bg-[#fff1f2] text-[#e11d48]"
                              : "bg-white text-[#7f5060] hover:bg-[#fffafa]"
                          }`}
                        >
                          {item}
                        </button>
                      ) : (
                        <span key={item} className="px-2 text-xs font-bold text-[#7f5060]">
                          ...
                        </span>
                      ),
                    )}
                    <button
                      type="button"
                      onClick={() => setPendingCollegesPage((current) => Math.min(pendingCollegesTotalPages, current + 1))}
                      disabled={pendingCollegesPage === pendingCollegesTotalPages}
                      className="rounded-md border border-[#fecdd3] bg-white px-4 py-1.5 text-xs font-bold text-[#be123c] transition hover:bg-[#fff1f2] disabled:cursor-not-allowed disabled:text-[#b9c3d2]"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white px-4 py-6 text-sm font-semibold text-[#60708f]">
                Every college has updated the dashboard at least once.
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
