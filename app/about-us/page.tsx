import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  Handshake,
  Landmark,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { colleges, courses } from "@/lib/site-data";

export default function AboutUsPage() {
  const impactMetrics = [
    { label: "Students Guided", value: `${Math.max(1200, courses.length * 75).toLocaleString()}+` },
    { label: "Colleges Onboarded", value: `${Math.max(100, colleges.length).toLocaleString()}+` },
    {
      label: "Internships Provided",
      value: `${Math.max(300, courses.filter((course) => course.isTopCourse).length * 40).toLocaleString()}+`,
    },
    {
      label: "Scholarships Facilitated",
      value: `${Math.max(180, colleges.filter((college) => college.isBestCollege).length * 30).toLocaleString()}+`,
    },
  ];
  const eyebrowClass =
    "text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--brand-primary-soft)]";
  const pageHeadingClass =
    "mt-4 max-w-3xl font-[family:var(--font-body)] text-3xl font-bold leading-tight text-[color:var(--text-dark)] sm:text-[2.35rem] md:text-[2.8rem]";
  const sectionHeadingClass =
    "font-[family:var(--font-body)] text-2xl font-bold leading-tight text-[color:var(--text-dark)] md:text-[2.2rem]";
  const cardHeadingClass =
    "font-[family:var(--font-body)] text-lg font-semibold leading-7 text-[color:var(--text-dark)]";

  return (
    <>
      <section className="relative overflow-hidden font-[family:var(--font-body)] text-slate-800">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)]" />
        <div className="mesh-bg" />
        <div className="hero-orb one" />
        <div className="hero-orb two" />
        <div className="relative z-10">
          <Navbar />
          <div className="page-container-full px-4 pb-14 pt-8 sm:px-6 md:pb-16 md:pt-10">
            <div className="max-w-4xl">
              <div className="editorial-kicker font-[family:var(--font-body)]">
                <Sparkles className="size-3.5" />
                About Us
              </div>
              <h1 className={pageHeadingClass}>
                Building a fair, data-driven education ecosystem for every student.
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[color:var(--text-muted)] sm:text-base">
                College EdwiseR connects students to trusted institutions, scholarships,
                and industry pathways.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/explore"
                  className="shine-button inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-accent)] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[color:var(--brand-accent-deep)]"
                >
                  Explore Colleges
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell page-section font-[family:var(--font-body)] bg-[color:var(--surface-base)] text-slate-800">
        <div className="page-container-full relative z-10 px-4 sm:px-6">
          <div className="rounded-[1.6rem] border border-[rgba(15,76,129,0.08)] bg-white/80 p-5 shadow-[0_20px_44px_rgba(12,24,46,0.12)] md:p-7">
            <div className="grid gap-5 md:grid-cols-2 md:gap-6">
              <div className="h-full rounded-[1.3rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(248,251,255,0.94)] p-5">
                <p className={eyebrowClass}>
                  Our Vision
                </p>
                <p className="mt-3 text-[1.05rem] font-semibold leading-8 text-[color:var(--text-dark)] sm:text-[1.12rem]">
                  To democratize quality education access by connecting students to the
                  right institutions, funding, and industry exposure.
                </p>
              </div>
              <div className="h-full rounded-[1.3rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(248,251,255,0.94)] p-5">
                <p className={eyebrowClass}>
                  Our Mission
                </p>
                <ul className="mt-3 space-y-2 text-[1.05rem] font-semibold leading-8 text-[color:var(--text-dark)] sm:text-[1.12rem]">
                  <li className="border-b border-[rgba(15,76,129,0.08)] pb-2">Simplify college selection</li>
                  <li className="border-b border-[rgba(15,76,129,0.08)] pb-2">Improve admission success</li>
                  <li className="border-b border-[rgba(15,76,129,0.08)] pb-2">Bridge academia and industry</li>
                  <li>Enable financial accessibility</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell page-section font-[family:var(--font-body)] bg-[color:var(--surface-muted)] text-slate-800">
        <div className="page-container-full relative z-10 px-4 sm:px-6">
          <h2 className={sectionHeadingClass}>Why College EdwiseR</h2>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            {[
              { icon: Building2, title: "Transparent college data" },
              { icon: GraduationCap, title: "Verified institutions" },
              { icon: Landmark, title: "Funding ecosystem" },
              { icon: BriefcaseBusiness, title: "Career-driven education approach" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex h-full items-start gap-4 rounded-[1.2rem] border border-[rgba(15,76,129,0.08)] bg-white/80 p-4">
                  <div className="inline-flex rounded-2xl bg-[rgba(16,37,78,0.08)] p-3 text-[color:var(--brand-primary-soft)]">
                    <Icon className="size-6" />
                  </div>
                  <h3 className={cardHeadingClass}>
                    {item.title}
                  </h3>
                </div>
              );
            })}
          </div>

          <h2 className={`${sectionHeadingClass} mt-8`}>Student Impact Metrics</h2>
          <div className="mt-2 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {impactMetrics.map((metric) => (
              <div
                key={metric.label}
                className="flex min-h-[9.5rem] flex-col justify-between rounded-[1.25rem] border border-[rgba(15,76,129,0.08)] bg-white/85 py-10 text-center shadow-[0_14px_30px_rgba(22,50,79,0.05)]"
              >
                <p className="font-[family:var(--font-body)] text-2xl font-bold leading-none text-[color:var(--brand-primary)] md:text-3xl">
                  {metric.value}
                </p>
                <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:text-xs">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section font-[family:var(--font-body)] bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)] text-slate-800">
        <div className="page-container-full px-4 sm:px-6">
          <h2 className={sectionHeadingClass}>Our Ecosystem Model</h2>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-semibold text-[color:var(--text-dark)] md:text-base">
            {["Students", "Colleges", "Industry", "CSR & Government", "Career Outcomes"].map(
              (item, index, arr) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="rounded-full border border-[rgba(15,76,129,0.12)] bg-white px-4 py-2 text-[color:var(--text-dark)]">
                    {item}
                  </span>
                  {index < arr.length - 1 ? (
                    <ArrowRight className="size-4 text-[color:var(--brand-accent-deep)]" />
                  ) : null}
                </div>
              ),
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
            {[
              { icon: GraduationCap, title: "Verified Colleges Across India" },
              { icon: Users, title: "Admission Support & Counseling" },
              { icon: Landmark, title: "CSR & Scholarship Funding Access" },
              { icon: BriefcaseBusiness, title: "Industry Internships & Projects" },
              { icon: Handshake, title: "Mentors from Academia & Corporates" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex h-full items-start gap-4 rounded-[1.2rem] border border-[rgba(15,76,129,0.08)] bg-white/85 p-4">
                  <Icon className="mt-1 size-5 text-[color:var(--brand-accent-deep)]" />
                  <h3 className={cardHeadingClass}>
                    {item.title}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-shell page-section font-[family:var(--font-body)] bg-[color:var(--surface-base)] text-slate-800">
        <div className="page-container-full relative z-10 px-4 sm:px-6">
          <h2 className={sectionHeadingClass}>How College EdwiseR Works</h2>
          <ol className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            {[
              "Discover Right Colleges",
              "Apply & Get Guided Admissions",
              "Access Funding & Scholarships",
              "Gain Industry Exposure",
              "Build Career Path",
            ].map((step, index) => (
              <li key={step} className="rounded-[1.1rem] border border-[rgba(15,76,129,0.08)] bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary-soft)]">
                  Step {index + 1}
                </p>
                <h3 className="mt-2.5 font-[family:var(--font-body)] text-base font-semibold leading-6 text-[color:var(--text-dark)]">
                  {step}
                </h3>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
