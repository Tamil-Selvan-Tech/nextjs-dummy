import { ArrowRight, BookOpen, BriefcaseBusiness, Globe2, Rocket, Sparkles, Target } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { servicePrograms } from "@/lib/service-programs";

const iconMap = {
  "career-guidance": Target,
  "skill-programs": BookOpen,
  placements: BriefcaseBusiness,
  internships: Rocket,
  "study-abroad": Globe2,
} as const;

const iconClassMap = {
  "career-guidance": "bg-[rgba(239,68,68,0.12)] text-[#ef4444]",
  "skill-programs": "bg-[rgba(37,99,235,0.12)] text-[#2563eb]",
  placements: "bg-[rgba(249,115,22,0.12)] text-[#f97316]",
  internships: "bg-[rgba(139,92,246,0.12)] text-[#8b5cf6]",
  "study-abroad": "bg-[rgba(14,165,233,0.12)] text-[#0284c7]",
} as const;

export default function ServicesPage() {
  return (
    <>
      <section className="relative overflow-hidden text-slate-800">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)]" />
        <div className="mesh-bg" />
        <div className="hero-orb one" />
        <div className="hero-orb three" />
        <div className="relative z-10">
          <Navbar />
          <div className="page-container-full pb-20 pt-10 px-4 sm:px-6 md:pt-14">
            <div className="max-w-4xl">
              <div className="editorial-kicker">
                <Sparkles className="size-3.5" />
                Services
              </div>
              <h1 className="mt-6 max-w-3xl font-[family:var(--font-display)] text-3xl font-bold leading-tight text-[color:var(--text-dark)] sm:text-[2.35rem] md:text-[2.8rem]">
                Five focused student services built to connect education decisions with real outcomes.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[color:var(--text-muted)] md:text-[15px]">
                Explore career guidance, skill development, placements, internships,
                and study abroad support under one consistent College EdwiseR experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell page-section bg-[#f2eee4] text-slate-800">
        <div className="page-container-full relative z-10 px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              What We Offer
            </p>
            <h2 className="mt-3 text-2xl font-bold leading-tight text-[color:var(--text-dark)] md:text-[2rem]">
              Dedicated programs students can explore and act on immediately
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {servicePrograms.map((service) => {
              const Icon = iconMap[service.slug];
              return (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group flex h-full flex-col rounded-[1.6rem] border border-[rgba(15,76,129,0.08)] bg-white/88 p-5 shadow-[0_16px_34px_rgba(22,50,79,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_40px_rgba(22,50,79,0.14)]"
                >
                  <div className={`inline-flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-2xl ${iconClassMap[service.slug]}`}>
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mt-4 font-[family:var(--font-display)] text-xl leading-snug text-[color:var(--text-dark)] md:text-[1.45rem]">
                    {service.menuLabel}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {service.description}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--brand-primary)]">
                    View Service
                    <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="page-section bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)] text-slate-800">
        <div className="page-container-full px-4 sm:px-6">
          <div className="rounded-[2rem] border border-[rgba(15,76,129,0.1)] bg-white/90 p-6 shadow-[0_18px_40px_rgba(22,50,79,0.08)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-primary)]">
              Why It Matters
            </p>
            <h2 className="mt-4 max-w-3xl font-[family:var(--font-display)] text-3xl font-bold leading-tight text-[color:var(--text-dark)] md:text-[2.45rem]">
              Every service page now follows the same premium theme while focusing on a specific student outcome.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--text-muted)] md:text-[15px]">
              This keeps the experience consistent for users while clearly separating counseling,
              upskilling, hiring, internships, and global education opportunities.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
