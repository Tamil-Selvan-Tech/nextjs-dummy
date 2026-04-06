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

  return (
    <>
      <section className="relative overflow-hidden text-slate-800">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)]" />
        <div className="mesh-bg" />
        <div className="hero-orb one" />
        <div className="hero-orb two" />
        <div className="relative z-10">
          <Navbar />
          <div className="page-container pb-14 pt-8 md:pt-10">
            <div className="max-w-5xl">
              <div className="editorial-kicker">
                <Sparkles className="size-3.5" />
                About Us
              </div>
              <h1 className="display-title mt-4 max-w-3xl text-[color:var(--text-dark)]">
                Building a fair, data-driven education ecosystem for every student.
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[color:var(--text-muted)]">
                College EdwiseR connects students to trusted institutions, scholarships,
                and industry pathways.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
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

      <section className="section-shell page-section bg-[color:var(--surface-base)] text-slate-800">
        <div className="page-container relative z-10">
          <div className="rounded-[1.6rem] border border-[rgba(15,76,129,0.08)] bg-white/80 p-5 shadow-[0_20px_44px_rgba(12,24,46,0.12)] md:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--brand-primary-soft)]">
                  Our Vision
                </p>
                <p className="mt-3 font-[family:var(--font-display)] text-xl leading-tight text-[color:var(--text-dark)] md:text-[1.8rem]">
                  To democratize quality education access by connecting students to the
                  right institutions, funding, and industry exposure.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--brand-primary-soft)]">
                  Our Mission
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  <li>Simplify college selection</li>
                  <li>Improve admission success</li>
                  <li>Bridge academia and industry</li>
                  <li>Enable financial accessibility</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell page-section bg-[color:var(--surface-muted)] text-slate-800">
        <div className="page-container relative z-10">
          <h2 className="section-title">Why College EdwiseR</h2>
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              { icon: Building2, title: "Transparent college data" },
              { icon: GraduationCap, title: "Verified institutions" },
              { icon: Landmark, title: "Funding ecosystem" },
              { icon: BriefcaseBusiness, title: "Career-driven education approach" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="inline-flex rounded-2xl bg-[rgba(16,37,78,0.08)] p-3 text-[color:var(--brand-primary-soft)]">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="font-[family:var(--font-display)] text-lg leading-snug text-[color:var(--text-dark)] md:text-xl">
                    {item.title}
                  </h3>
                </div>
              );
            })}
          </div>

          <h2 className="section-title mt-8">Student Impact Metrics</h2>
          <div className="mt-5 flex flex-wrap gap-5">
            {impactMetrics.map((metric) => (
              <div key={metric.label} className="min-w-[10.5rem]">
                <p className="font-[family:var(--font-display)] text-2xl leading-none text-[color:var(--brand-primary)] md:text-3xl">
                  {metric.value}
                </p>
                <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)] text-slate-800">
        <div className="page-container">
          <h2 className="section-title">Our Ecosystem Model</h2>
          <div className="mt-5 flex flex-wrap items-center gap-2.5 text-sm font-semibold text-[color:var(--text-dark)] md:text-base">
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

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              { icon: GraduationCap, title: "Verified Colleges Across India" },
              { icon: Users, title: "Admission Support & Counseling" },
              { icon: Landmark, title: "CSR & Scholarship Funding Access" },
              { icon: BriefcaseBusiness, title: "Industry Internships & Projects" },
              { icon: Handshake, title: "Mentors from Academia & Corporates" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-4">
                  <Icon className="mt-1 size-5 text-[color:var(--brand-accent-deep)]" />
                  <h3 className="font-[family:var(--font-display)] text-lg leading-snug text-[color:var(--text-dark)] md:text-xl">
                    {item.title}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-shell page-section bg-[color:var(--surface-base)] text-slate-800">
        <div className="page-container relative z-10">
          <h2 className="section-title">How College EdwiseR Works</h2>
          <ol className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
            {[
              "Discover Right Colleges",
              "Apply & Get Guided Admissions",
              "Access Funding & Scholarships",
              "Gain Industry Exposure",
              "Build Career Path",
            ].map((step, index) => (
              <li key={step} className="rounded-[1.1rem] border border-[rgba(15,76,129,0.08)] bg-white/80 p-3.5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary-soft)]">
                  Step {index + 1}
                </p>
                <h3 className="mt-2 text-sm font-bold leading-snug text-[color:var(--text-dark)] md:text-base">
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
