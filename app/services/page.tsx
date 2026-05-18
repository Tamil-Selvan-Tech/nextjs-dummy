import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Globe2,
  Rocket,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";

import Link from "next/link";

import { Navbar } from "@/components/navbar";

import {
  servicePrograms,
  type ServiceProgramSlug,
} from "@/lib/service-programs";

const iconMap: Record<ServiceProgramSlug, LucideIcon> = {
  "career-guidance": Target,
  "skill-programs": BookOpen,
  placements: BriefcaseBusiness,
  internships: Rocket,
  "study-abroad": Globe2,
};

const iconClassMap: Record<ServiceProgramSlug, string> = {
  "career-guidance":
    "bg-[rgba(239,68,68,0.12)] text-[#ef4444]",

  "skill-programs":
    "bg-[rgba(37,99,235,0.12)] text-[#2563eb]",

  placements:
    "bg-[rgba(249,115,22,0.12)] text-[#f97316]",

  internships:
    "bg-[rgba(139,92,246,0.12)] text-[#8b5cf6]",

  "study-abroad":
    "bg-[rgba(14,165,233,0.12)] text-[#0284c7]",
};

export default function ServicesPage() {
  return (
    <>
      {/* HERO */}

      <section className="relative overflow-hidden font-sans text-slate-800">

        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)]" />

        <div className="mesh-bg" />
        <div className="hero-orb one" />
        <div className="hero-orb three" />

        <div className="relative z-10">

          <Navbar />

          <div className="page-container-full px-4 pb-8 pt-5 sm:px-6 md:pb-10 md:pt-7">

            <div className="max-w-3xl">

              <div className="editorial-kicker flex items-center gap-2 text-[10px] font-medium tracking-[0.15em]">
                <Sparkles className="size-3" />
                Services
              </div>

              <h1 className="mt-3 max-w-4xl text-[1.7rem] font-semibold leading-[1.25] text-[color:var(--text-dark)] sm:text-[1.9rem] md:text-[2.1rem]">
                Five focused student services built to connect education decisions with real outcomes.
              </h1>

              <p className="mt-2.5 max-w-2xl text-[13px] leading-6 text-[color:var(--text-muted)] sm:text-sm">
                Explore career guidance, skill development, placements,
                internships, and study abroad support under one consistent
                College EdwiseR experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}

      <section className="section-shell page-section bg-[#f2eee4] py-8 font-sans text-slate-800">

        <div className="page-container-full relative z-10 px-4 sm:px-6">

          <div className="mx-auto max-w-2xl text-center">

            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-700">
              What We Offer
            </p>

            <h2 className="mt-2 text-[1.5rem] font-semibold leading-snug text-[color:var(--text-dark)] md:text-[1.8rem]">
              Dedicated programs students can explore and act on immediately
            </h2>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">

            {servicePrograms.map((service) => {
              const Icon = iconMap[service.slug];

              return (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group flex h-full flex-col rounded-[1.2rem] border border-[rgba(15,76,129,0.08)] bg-white/90 p-4 shadow-[0_10px_24px_rgba(22,50,79,0.05)] transition hover:-translate-y-1"
                >

                  <div
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconClassMap[service.slug]}`}
                  >
                    <Icon className="size-4.5" />
                  </div>

                  <h3 className="mt-3 text-[15px] font-semibold leading-6 text-[color:var(--text-dark)] sm:text-[16px]">
                    {service.menuLabel}
                  </h3>

                  <p className="mt-1 text-[13px] leading-6 text-slate-600">
                    {service.description}
                  </p>

                  <div className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-[color:var(--brand-primary)] sm:text-[13px]">
                    View Service

                    <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY IT MATTERS */}

      <section className="page-section bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)] py-8 font-sans text-slate-800">

        <div className="page-container-full px-4 sm:px-6">

          <div className="rounded-[1.4rem] border border-[rgba(15,76,129,0.1)] bg-white/90 p-5 shadow-[0_12px_28px_rgba(22,50,79,0.05)]">

            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">
              Why It Matters
            </p>

            <h2 className="mt-2 max-w-3xl text-[1.5rem] font-semibold leading-snug text-[color:var(--text-dark)] md:text-[1.8rem]">
              Every service page now follows the same premium theme while focusing on a specific student outcome.
            </h2>

            <p className="mt-2.5 max-w-3xl text-[13px] leading-6 text-[color:var(--text-muted)] sm:text-sm">
              This keeps the experience consistent for users while clearly
              separating counseling, upskilling, hiring, internships, and
              global education opportunities.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}