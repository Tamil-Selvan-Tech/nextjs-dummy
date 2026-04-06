import { FileText, Sparkles } from "lucide-react";
import { Navbar } from "@/components/navbar";

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
      <section className="relative overflow-hidden text-slate-800">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)]" />
        <div className="mesh-bg" />
        <div className="relative z-10">
          <Navbar />
          <div className="page-container pb-16 pt-10 md:pt-14">
            <div className="max-w-4xl">
              <div className="editorial-kicker">
                <Sparkles className="size-3.5" />
                Terms &amp; Conditions
              </div>
              <h1 className="mt-6 max-w-3xl font-[family:var(--font-display)] text-3xl font-bold leading-tight text-[color:var(--text-dark)] sm:text-[2.35rem] md:text-[2.8rem]">
                Please read these terms carefully before using the platform.
              </h1>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-[color:var(--text-muted)] md:text-[15px]">
                By accessing and using College EdwiseR, you acknowledge that the
                platform is intended to help users discover and compare educational
                options. Use of the platform means you accept the terms below and
                understand the limits of the information presented.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell page-section bg-[color:var(--surface-base)] text-slate-800">
        <div className="page-container relative z-10">
          <div className="space-y-8">
            <div className="space-y-6">
              {termSections.map((section) => (
                <div key={section.title} className="border-b border-slate-200 pb-5 last:border-b-0 last:pb-0">
                  <h2 className="text-xl font-semibold leading-tight text-[color:var(--text-dark)] md:text-2xl">
                    {section.title}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-slate-600 md:text-[15px]">
                    {section.body}
                  </p>
                </div>
              ))}

              <article className="rounded-[1.8rem] border border-amber-200 bg-amber-50 p-5 shadow-[0_20px_40px_rgba(201,161,84,0.15)] md:p-6">
                <h2 className="text-xl font-semibold leading-tight text-[color:var(--text-dark)] md:text-2xl">
                  Important Note
                </h2>
                <p className="mt-4 text-sm leading-6 text-slate-700 md:text-[15px]">
                  The platform does not guarantee that every listing will always reflect
                  the latest official change immediately. Users are strongly advised to
                  confirm critical details directly with the college before applying,
                  enrolling, or making any payment.
                </p>
              </article>
            </div>

            <div className="grid gap-4 rounded-[1.6rem] border border-[rgba(15,76,129,0.08)] bg-white/85 p-5 shadow-[0_18px_40px_rgba(22,50,79,0.08)] md:grid-cols-[1.1fr_0.9fr] md:p-6">
              <div>
                <div className="flex items-center gap-3">
                  <FileText className="size-6 text-[color:var(--brand-accent)]" />
                  <h2 className="font-[family:var(--font-display)] text-xl leading-tight text-[color:var(--text-dark)] md:text-2xl">
                    Responsible Use
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Information shown on the platform may change over time, so
                  admission-related decisions should always be cross-checked with
                  institutions before acting on them.
                </p>
              </div>
              <div className="md:border-l md:border-slate-200 md:pl-5">
                <h2 className="font-[family:var(--font-display)] text-xl leading-tight text-[color:var(--text-dark)] md:text-2xl">
                  Need Clarification?
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  If you have questions about these Terms &amp; Conditions, please
                  contact our support team.
                </p>
                <p className="mt-4 text-base font-semibold text-[color:var(--brand-primary)]">
                  support@collegeedwiser.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
