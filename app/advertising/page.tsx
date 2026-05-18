import {
  BadgeCheck,
  BarChart3,
  Megaphone,
  Sparkles,
  Target,
} from "lucide-react";

import { Navbar } from "@/components/navbar";

const offerings = [
  {
    title: "Featured College Spotlight",
    description:
      "Highlight your institution at high-visibility positions to improve discovery among targeted student segments.",
    icon: Megaphone,
  },
  {
    title: "Audience Targeting",
    description:
      "Reach students by course intent, location interests, and higher-education preferences for better campaign relevance.",
    icon: Target,
  },
  {
    title: "Performance Insights",
    description:
      "Track campaign engagement with clear metrics to understand visibility, clicks, and student actions.",
    icon: BarChart3,
  },
];

export default function AdvertisingPage() {
  return (
    <>
      <section className="relative overflow-hidden font-[family:var(--font-body)] text-slate-800">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)]" />

        <div className="mesh-bg" />
        <div className="hero-orb one" />
        <div className="hero-orb two" />

        <div className="relative z-10">
          <Navbar />

          <div className="page-container-full px-4 pb-10 pt-6 sm:px-6 md:pb-12 md:pt-8">
            <div className="max-w-3xl">

              {/* TOP LABEL */}

              <div className="editorial-kicker text-[10px] font-semibold tracking-[0.16em]">
                <Sparkles className="size-3" />
                Advertising
              </div>

              {/* HERO TITLE */}

              <h1 className="mt-4 max-w-4xl font-[family:var(--font-display)] text-[1.75rem] font-semibold leading-[1.2] text-[color:var(--text-dark)] sm:text-[1.95rem] md:text-[2.2rem]">
                Promote your college to the right students with focused digital
                visibility.
              </h1>

              {/* DESCRIPTION */}

              <p className="mt-3 max-w-2xl text-[13px] leading-6 text-[color:var(--text-muted)] md:text-[14px]">
                College EdwiseR advertising solutions are designed for institutions
                that want quality reach, better intent matching, and transparent
                campaign outcomes.
              </p>

              {/* BADGE CARD */}

              <div className="mt-5 inline-flex items-center gap-3 rounded-[1.1rem] border border-[rgba(15,76,129,0.08)] bg-white/90 px-4 py-3 shadow-[0_10px_24px_rgba(15,76,129,0.05)]">

                <div className="rounded-xl bg-[rgba(15,76,129,0.08)] p-2.5 text-[color:var(--brand-primary)]">
                  <BadgeCheck className="size-5" />
                </div>

                <p className="text-[13px] font-medium leading-5 text-[color:var(--text-dark)]">
                  Built for admissions visibility and trust-led student engagement
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECOND SECTION */}

      <section className="section-shell page-section bg-[#f6f8ff] font-[family:var(--font-body)] text-slate-800">

        <div className="page-container relative z-10">

          <div className="mx-auto max-w-2xl text-center">

            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">
              Campaign Services
            </p>

            <h2 className="mt-2 font-[family:var(--font-display)] text-[1.45rem] font-semibold leading-[1.3] text-slate-900 md:text-[1.8rem]">
              Advertising support focused on student intent and measurable outcomes
            </h2>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">

            {offerings.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-[1.2rem] border border-[rgba(15,76,129,0.08)] bg-white p-4 shadow-[0_10px_22px_rgba(15,76,129,0.04)] transition hover:-translate-y-1"
                >

                  <div className="inline-flex rounded-xl bg-blue-100 p-3 text-blue-700">
                    <Icon className="size-5" />
                  </div>

                  <h3 className="mt-4 font-[family:var(--font-display)] text-[1rem] font-semibold leading-6 text-slate-900 md:text-[1.08rem]">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-[13px] leading-6 text-slate-600 md:text-[14px]">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}