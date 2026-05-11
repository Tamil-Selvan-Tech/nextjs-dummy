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
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import {
  getServiceProgramBySlug,
  servicePrograms,
  type ServiceProgramSlug,
} from "@/lib/service-programs";

type ServiceDetailPageProps = {
  params: Promise<{ serviceSlug: string }>;
};

const iconMap: Record<ServiceProgramSlug, LucideIcon> = {
  "career-guidance": Target,
  "skill-programs": BookOpen,
  placements: BriefcaseBusiness,
  internships: Rocket,
  "study-abroad": Globe2,
};

const accentMap: Record<ServiceProgramSlug, string> = {
  "career-guidance": "bg-[rgba(239,68,68,0.12)] text-[#ef4444]",
  "skill-programs": "bg-[rgba(37,99,235,0.12)] text-[#2563eb]",
  placements: "bg-[rgba(249,115,22,0.12)] text-[#f97316]",
  internships: "bg-[rgba(139,92,246,0.12)] text-[#8b5cf6]",
  "study-abroad": "bg-[rgba(14,165,233,0.12)] text-[#0284c7]",
};

export async function generateStaticParams() {
  return servicePrograms.map((program) => ({ serviceSlug: program.slug }));
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { serviceSlug } = await params;
  const service = getServiceProgramBySlug(serviceSlug);

  if (!service) notFound();

  const Icon = iconMap[service.slug];
  const accentClassName = accentMap[service.slug];

  return (
    <>
      <section className="relative overflow-hidden text-slate-800">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)]" />
        <div className="mesh-bg" />
        <div className="hero-orb one" />
        <div className="hero-orb three" />
        <div className="relative z-10">
          <Navbar />
          <div className="page-container-full px-4 pb-16 pt-8 sm:px-6 md:pb-20 md:pt-10">
            <div className="max-w-5xl">
              <div className="editorial-kicker">
                <Sparkles className="size-3.5" />
                Service Program
              </div>
              <div className="mt-6 flex items-start gap-4">
                <div className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl ${accentClassName}`}>
                  <Icon className="size-7" />
                </div>
                <div>
                  <h1 className="max-w-4xl font-[family:var(--font-display)] text-3xl font-bold leading-tight text-[color:var(--text-dark)] sm:text-[2.4rem] md:text-[2.9rem]">
                    {service.title}
                  </h1>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--text-muted)] md:text-[15px]">
                    {service.description}
                  </p>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,76,129,0.12)] bg-white px-5 py-3 text-sm font-semibold text-[color:var(--text-dark)] transition hover:bg-[rgba(15,76,129,0.04)]"
                >
                  Back to Services
                </Link>
                <Link
                  href="/contact"
                  className="shine-button inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-accent)] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[color:var(--brand-accent-deep)]"
                >
                  Talk to Our Team
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section bg-[color:var(--surface-base)] text-slate-800">
        <div className="page-container-full px-4 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2rem] border border-[rgba(15,76,129,0.1)] bg-white/90 p-6 shadow-[0_18px_40px_rgba(22,50,79,0.08)] md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-primary-soft)]">
                Objective
              </p>
              <h2 className="mt-4 font-[family:var(--font-display)] text-2xl font-bold leading-tight text-[color:var(--text-dark)] md:text-[2.1rem]">
                Designed to create stronger student outcomes
              </h2>
              <p className="mt-4 text-sm leading-7 text-[color:var(--text-muted)] md:text-[15px]">
                {service.objective}
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-600 md:text-[15px]">
                {service.intro}
              </p>
            </div>

            <div className="rounded-[2rem] border border-[rgba(15,76,129,0.1)] bg-[linear-gradient(180deg,rgba(248,251,255,0.98),rgba(239,246,255,0.98))] p-6 shadow-[0_18px_40px_rgba(22,50,79,0.08)] md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-primary-soft)]">
                Outcome Focus
              </p>
              <div className="mt-4 space-y-3">
                {service.deliverables.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.2rem] border border-[rgba(15,76,129,0.08)] bg-white/85 px-4 py-3 text-sm font-semibold text-[color:var(--text-dark)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section bg-[linear-gradient(180deg,#f9fbff_0%,#f2f7ff_100%)] text-slate-800">
        <div className="page-container-full px-4 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[1.8rem] border border-[rgba(15,76,129,0.08)] bg-white/92 p-6 shadow-[0_16px_34px_rgba(22,50,79,0.08)] md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-primary-soft)]">
                Ideal For
              </p>
              <div className="mt-5 space-y-3">
                {service.idealFor.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.15rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(248,251,255,0.92)] px-4 py-3 text-sm leading-6 text-[color:var(--text-dark)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-[rgba(15,76,129,0.08)] bg-white/92 p-6 shadow-[0_16px_34px_rgba(22,50,79,0.08)] md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-primary-soft)]">
                Program Highlights
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {service.highlights.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.15rem] border border-[rgba(15,76,129,0.08)] bg-white/90 px-4 py-4 text-sm font-medium leading-6 text-[color:var(--text-dark)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell page-section bg-[color:var(--surface-muted)] text-slate-800">
        <div className="page-container-full px-4 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[1.8rem] border border-[rgba(15,76,129,0.08)] bg-white/90 p-6 shadow-[0_16px_34px_rgba(22,50,79,0.08)] md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-primary-soft)]">
                Services Offered
              </p>
              <div className="mt-5 space-y-3">
                {service.servicesOffered.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.15rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(248,251,255,0.94)] px-4 py-3 text-sm leading-6 text-[color:var(--text-dark)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[1.8rem] border border-[rgba(15,76,129,0.08)] bg-white/90 p-6 shadow-[0_16px_34px_rgba(22,50,79,0.08)] md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-primary-soft)]">
                  Deliverables
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {service.deliverables.map((item) => (
                    <div
                      key={item}
                      className="rounded-[1.15rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(255,255,255,0.92)] px-4 py-4 text-sm font-semibold text-[color:var(--text-dark)]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.8rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(135deg,#ffffff,#f7faff)] p-6 shadow-[0_16px_34px_rgba(22,50,79,0.08)] md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-primary-soft)]">
                  Revenue Model
                </p>
                <div className="mt-5 space-y-3">
                  {service.revenueModel.map((item) => (
                    <div
                      key={item}
                      className="rounded-[1.15rem] border border-[rgba(15,76,129,0.08)] bg-white/90 px-4 py-3 text-sm font-medium text-[color:var(--text-dark)]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section bg-[color:var(--surface-base)] text-slate-800">
        <div className="page-container-full px-4 sm:px-6">
          <div className="rounded-[2rem] border border-[rgba(15,76,129,0.1)] bg-white/92 p-6 shadow-[0_18px_40px_rgba(22,50,79,0.08)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-primary-soft)]">
              How It Works
            </p>
            <h2 className="mt-4 max-w-3xl font-[family:var(--font-display)] text-2xl font-bold leading-tight text-[color:var(--text-dark)] md:text-[2.2rem]">
              A structured service flow that helps students move from planning to measurable outcomes
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {service.process.map((step, index) => (
                <div
                  key={step}
                  className="rounded-[1.2rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(248,251,255,0.95),rgba(255,255,255,0.96))] p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary-soft)]">
                    Step {index + 1}
                  </p>
                  <p className="mt-2.5 text-sm font-semibold leading-6 text-[color:var(--text-dark)]">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
