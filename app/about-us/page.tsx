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
    {
      label: "Students Guided",
      value: `${Math.max(
        1200,
        courses.length * 75
      ).toLocaleString()}+`,
    },

    {
      label: "Colleges Onboarded",
      value: `${Math.max(
        100,
        colleges.length
      ).toLocaleString()}+`,
    },

    {
      label: "Internships Provided",
      value: `${Math.max(
        300,
        courses.filter((course) => course.isTopCourse).length * 40
      ).toLocaleString()}+`,
    },

    {
      label: "Scholarships Facilitated",
      value: `${Math.max(
        180,
        colleges.filter((college) => college.isBestCollege).length * 30
      ).toLocaleString()}+`,
    },
  ];

  const eyebrowClass =
    "text-[10px] font-medium uppercase tracking-[0.16em] text-[color:var(--brand-primary-soft)]";

  const pageHeadingClass =
    "mt-3 max-w-4xl font-sans text-[1.8rem] font-semibold leading-[1.25] text-[color:var(--text-dark)] sm:text-[2rem] md:text-[2.2rem]";

  const sectionHeadingClass =
    "font-sans text-[1.45rem] font-semibold leading-tight text-[color:var(--text-dark)] md:text-[1.7rem]";

  const cardHeadingClass =
    "font-sans text-[14px] font-medium leading-6 text-[color:var(--text-dark)]";

  return (
    <>
      {/* HERO */}

      <section className="relative overflow-hidden font-sans text-slate-800">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)]" />

        <div className="mesh-bg" />
        <div className="hero-orb one" />
        <div className="hero-orb two" />

        <div className="relative z-10">
          <Navbar />

          <div className="page-container-full px-4 pb-8 pt-5 sm:px-6 md:pb-10 md:pt-7">
            <div className="max-w-4xl">

              <div className="editorial-kicker flex items-center gap-2 text-[10px] font-medium tracking-[0.15em]">
                <Sparkles className="size-3" />
                About Us
              </div>

              <h1 className={pageHeadingClass}>
                Building a fair, data-driven education ecosystem for every student.
              </h1>

              <p className="mt-2.5 max-w-2xl text-[13px] leading-6 text-[color:var(--text-muted)] sm:text-sm">
                College EdwiseR connects students to trusted institutions,
                scholarships, and industry pathways.
              </p>

              <div className="mt-4 flex flex-wrap gap-2.5">
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-accent)] px-4 py-2 text-[13px] font-medium text-slate-950 transition hover:bg-[color:var(--brand-accent-deep)]"
                >
                  Explore Colleges
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VISION & MISSION */}

      <section className="section-shell page-section bg-[color:var(--surface-base)] py-8 font-sans text-slate-800">

        <div className="page-container-full relative z-10 px-4 sm:px-6">

          <div className="rounded-[1.2rem] border border-[rgba(15,76,129,0.08)] bg-white/80 p-4 shadow-[0_12px_30px_rgba(12,24,46,0.06)]">

            <div className="grid gap-3 md:grid-cols-2">

              <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(248,251,255,0.94)] p-4">

                <p className={eyebrowClass}>
                  Our Vision
                </p>

                <p className="mt-2 text-[14px] font-medium leading-6 text-[color:var(--text-dark)]">
                  To democratize quality education access by connecting students
                  to the right institutions, funding, and industry exposure.
                </p>
              </div>

              <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(248,251,255,0.94)] p-4">

                <p className={eyebrowClass}>
                  Our Mission
                </p>

                <ul className="mt-2 space-y-1 text-[14px] font-medium leading-6 text-[color:var(--text-dark)]">

                  <li className="border-b border-[rgba(15,76,129,0.08)] pb-1">
                    Simplify college selection
                  </li>

                  <li className="border-b border-[rgba(15,76,129,0.08)] pb-1">
                    Improve admission success
                  </li>

                  <li className="border-b border-[rgba(15,76,129,0.08)] pb-1">
                    Bridge academia and industry
                  </li>

                  <li>
                    Enable financial accessibility
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY */}

      <section className="section-shell page-section bg-[color:var(--surface-muted)] py-8 font-sans text-slate-800">

        <div className="page-container-full relative z-10 px-4 sm:px-6">

          <h2 className={sectionHeadingClass}>
            Why College EdwiseR
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">

            {[
              {
                icon: Building2,
                title: "Transparent college data",
              },

              {
                icon: GraduationCap,
                title: "Verified institutions",
              },

              {
                icon: Landmark,
                title: "Funding ecosystem",
              },

              {
                icon: BriefcaseBusiness,
                title: "Career-driven education approach",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white/85 p-3.5"
                >
                  <div className="inline-flex rounded-xl bg-[rgba(16,37,78,0.08)] p-2 text-[color:var(--brand-primary-soft)]">
                    <Icon className="size-4.5" />
                  </div>

                  <h3 className={cardHeadingClass}>
                    {item.title}
                  </h3>
                </div>
              );
            })}
          </div>

          {/* METRICS */}

          <h2 className={`${sectionHeadingClass} mt-7`}>
            Student Impact Metrics
          </h2>

          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">

            {impactMetrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white/90 px-4 py-5 text-center shadow-[0_8px_20px_rgba(22,50,79,0.04)]"
              >
                <p className="text-[1.4rem] font-semibold text-[color:var(--brand-primary)]">
                  {metric.value}
                </p>

                <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ECOSYSTEM */}

      <section className="page-section bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)] py-8 font-sans text-slate-800">

        <div className="page-container-full px-4 sm:px-6">

          <h2 className={sectionHeadingClass}>
            Our Ecosystem Model
          </h2>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-medium text-[color:var(--text-dark)] sm:text-[12px]">

            {[
              "Students",
              "Colleges",
              "Industry",
              "CSR & Government",
              "Career Outcomes",
            ].map((item, index, arr) => (
              <div
                key={item}
                className="flex items-center gap-2"
              >
                <span className="rounded-full border border-[rgba(15,76,129,0.12)] bg-white px-3 py-1.5">
                  {item}
                </span>

                {index < arr.length - 1 ? (
                  <ArrowRight className="size-3 text-[color:var(--brand-accent-deep)]" />
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">

            {[
              {
                icon: GraduationCap,
                title: "Verified Colleges Across India",
              },

              {
                icon: Users,
                title: "Admission Support & Counseling",
              },

              {
                icon: Landmark,
                title: "CSR & Scholarship Funding Access",
              },

              {
                icon: BriefcaseBusiness,
                title: "Industry Internships & Projects",
              },

              {
                icon: Handshake,
                title: "Mentors from Academia & Corporates",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white/90 p-3.5"
                >
                  <Icon className="mt-1 size-4 text-[color:var(--brand-accent-deep)]" />

                  <h3 className={cardHeadingClass}>
                    {item.title}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}

      <section className="section-shell page-section bg-[color:var(--surface-base)] py-8 font-sans text-slate-800">

        <div className="page-container-full relative z-10 px-4 sm:px-6">

          <h2 className={sectionHeadingClass}>
            How College EdwiseR Works
          </h2>

          <ol className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">

            {[
              "Discover Right Colleges",
              "Apply & Get Guided Admissions",
              "Access Funding & Scholarships",
              "Gain Industry Exposure",
              "Build Career Path",
            ].map((step, index) => (
              <li
                key={step}
                className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white/85 p-3.5"
              >
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[color:var(--brand-primary-soft)]">
                  Step {index + 1}
                </p>

                <h3 className="mt-1.5 text-[13px] font-semibold leading-5 text-[color:var(--text-dark)]">
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