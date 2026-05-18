import { FileText, Sparkles } from "lucide-react";
import { Navbar } from "@/components/navbar";

const supportEmailHref =
  "https://mail.google.com/mail/?view=cm&fs=1&to=support@collegeedwiser.com";

const termSections = [
  {
    title: "Information Scope",
    body:
      "College fees, admission cutoffs, seat availability, eligibility criteria, and related details shown on this platform are subject to change at any time. The information displayed should be treated as a general reference and not as a final confirmation.",
  },
  {
    title: "Data Sources",
    body:
      "The data presented on this platform is compiled from common and publicly available sources, including college websites, brochures, counselling references, and other informational materials. While we aim to keep it useful and organized, delays or differences may occur between the platform and official updates.",
  },
  {
    title: "Verify With Colleges",
    body:
      "For the most accurate and latest information regarding admissions, fee structure, scholarships, approvals, placements, and cutoffs, users must directly contact the respective college or official admission authority before making any decision.",
  },
  {
    title: "Platform Fees",
    body:
      "College EdwiseR does not collect admission fees, tuition fees, or any college-related payment on behalf of institutions through this platform. Any payment decision should be made only after verifying the official payment instructions with the college concerned.",
  },
];

export default function TermsPage() {
  return (
    <>
      {/* HERO SECTION */}

      <section className="relative overflow-hidden font-[family:var(--font-body)] text-slate-800">

        {/* BACKGROUND */}

        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)]" />

        <div className="mesh-bg" />

        {/* IMPORTANT Z-INDEX FIX */}

        <div className="relative z-[999]">

          <Navbar />

          <div className="page-container-full px-4 pb-8 pt-5 sm:px-6 md:pb-12 md:pt-8">

            <div className="max-w-4xl">

              {/* TOP LABEL */}

              <div className="editorial-kicker text-[10px] font-semibold tracking-[0.16em]">
                <Sparkles className="size-3" />
                Terms &amp; Conditions
              </div>

              {/* HERO TITLE */}

              <h1 className="mt-4 max-w-4xl font-[family:var(--font-display)] text-[1.5rem] font-semibold leading-[1.2] text-[color:var(--text-dark)] sm:text-[1.8rem] md:text-[2.2rem]">
                Please read these terms carefully before using the platform.
              </h1>

              {/* DESCRIPTION */}

              <p className="mt-3 max-w-3xl text-[13px] leading-6 text-[color:var(--text-muted)] md:text-[14px]">
                By accessing and using College EdwiseR, you acknowledge that the
                platform is intended to help users discover and compare
                educational options. Use of the platform means you accept the
                terms below and understand the limits of the information
                presented.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECOND SECTION */}

      <section className="section-shell page-section relative z-10 bg-[color:var(--surface-base)] font-[family:var(--font-body)] text-slate-800">

        <div className="page-container-full relative z-10 px-4 sm:px-6 md:px-8">

          <div className="space-y-6">

            {/* TERMS CONTENT */}

            <div className="space-y-5">

              {termSections.map((section) => (
                <div
                  key={section.title}
                  className="border-b border-slate-200 pb-4 last:border-b-0 last:pb-0"
                >

                  <h2 className="font-[family:var(--font-display)] text-[1rem] font-semibold leading-6 text-[color:var(--text-dark)] md:text-[1.08rem]">
                    {section.title}
                  </h2>

                  <p className="mt-1.5 text-[13px] leading-6 text-slate-600 md:text-[14px]">
                    {section.body}
                  </p>
                </div>
              ))}

              {/* IMPORTANT NOTE */}

              <article className="rounded-[1.3rem] border border-amber-200 bg-amber-50 p-4 shadow-[0_12px_28px_rgba(201,161,84,0.12)] md:p-5">

                <h2 className="font-[family:var(--font-display)] text-[1rem] font-semibold leading-tight text-[color:var(--text-dark)] md:text-[1.08rem]">
                  Important Note
                </h2>

                <p className="mt-2 text-[13px] leading-6 text-slate-700 md:text-[14px]">
                  The platform does not guarantee that every listing will always
                  reflect the latest official change immediately. Users are
                  strongly advised to confirm critical details directly with the
                  college before applying, enrolling, or making any payment.
                </p>
              </article>
            </div>

            {/* BOTTOM CARD */}

            <div className="grid gap-4 rounded-[1.3rem] border border-[rgba(15,76,129,0.08)] bg-white/95 p-4 shadow-[0_10px_22px_rgba(22,50,79,0.05)] md:grid-cols-[1.1fr_0.9fr] md:p-5">

              {/* LEFT SIDE */}

              <div>

                <div className="flex items-center gap-2.5">

                  <FileText className="size-5 text-[color:var(--brand-accent)]" />

                  <h2 className="font-[family:var(--font-display)] text-[1rem] font-semibold leading-tight text-[color:var(--text-dark)] md:text-[1.08rem]">
                    Responsible Use
                  </h2>
                </div>

                <p className="mt-2 text-[13px] leading-6 text-slate-600 md:text-[14px]">
                  Information shown on the platform may change over time, so
                  admission-related decisions should always be cross-checked
                  with institutions before acting on them.
                </p>
              </div>

              {/* RIGHT SIDE */}

              <div className="md:border-l md:border-slate-200 md:pl-4">

                <h2 className="font-[family:var(--font-display)] text-[1rem] font-semibold leading-tight text-[color:var(--text-dark)] md:text-[1.08rem]">
                  Need Clarification?
                </h2>

                <p className="mt-2 text-[13px] leading-6 text-slate-600 md:text-[14px]">
                  If you have questions about these Terms &amp; Conditions,
                  please contact our support team.
                </p>

                <a
                  href={supportEmailHref}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex break-all text-[13px] font-semibold text-[color:var(--brand-primary)] transition hover:text-[color:var(--brand-primary-soft)] md:text-[14px]"
                >
                  support@collegeedwiser.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}