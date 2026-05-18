import {
  BookOpenCheck,
  BriefcaseBusiness,
  Rocket,
  Sparkles,
  Users,
} from "lucide-react";

import { Navbar } from "@/components/navbar";

const values = [
  {
    title: "Mission-Driven Work",
    description:
      "Work on products that help students discover better academic and career opportunities.",
    icon: Rocket,
  },
  {
    title: "Collaborative Team",
    description:
      "Grow in a team culture that values ownership, clarity, and practical impact over noise.",
    icon: Users,
  },
  {
    title: "Continuous Learning",
    description:
      "Build your skills with real product challenges, mentoring, and feedback-oriented execution.",
    icon: BookOpenCheck,
  },
];

export default function CareersPage() {
  return (
    <>
      <section className="relative overflow-hidden font-[family:var(--font-body)] text-slate-800">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)]" />

        <div className="mesh-bg" />

        <div className="relative z-10">
          <Navbar />

          <div className="page-container-full px-4 pb-10 pt-6 sm:px-6 md:pb-12 md:pt-8">
            <div className="max-w-4xl">

              {/* TOP LABEL */}

              <div className="editorial-kicker text-[10px] font-semibold tracking-[0.16em]">
                <Sparkles className="size-3" />
                Careers
              </div>

              {/* HERO TITLE */}

              <h1 className="mt-4 max-w-4xl font-[family:var(--font-display)] text-[1.75rem] font-semibold leading-[1.2] text-[color:var(--text-dark)] sm:text-[1.95rem] md:text-[2.2rem]">
                Join us to build student-first products for higher education
                discovery.
              </h1>

              {/* DESCRIPTION */}

              <p className="mt-3 max-w-2xl text-[13px] leading-6 text-[color:var(--text-muted)] md:text-[14px]">
                We are creating practical tools that connect students, colleges,
                and outcomes. If you like solving real problems with clean
                execution, you will fit right in.
              </p>

              {/* HIRING CARD */}

              <div className="mt-5 inline-flex items-center gap-3 rounded-[1.1rem] border border-[rgba(15,76,129,0.08)] bg-white/90 px-4 py-3 shadow-[0_10px_24px_rgba(22,50,79,0.05)]">

                <div className="rounded-xl bg-blue-100 p-2.5 text-blue-700">
                  <BriefcaseBusiness className="size-5" />
                </div>

                <p className="text-[13px] font-medium leading-5 text-[color:var(--text-dark)]">
                  Hiring for builders who care about product quality and student impact
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECOND SECTION */}

      <section className="section-shell page-section bg-[#f6f8ff] font-[family:var(--font-body)] text-slate-800">

        <div className="page-container-full relative z-10 px-4 sm:px-6 md:px-10">

          <div className="mx-auto max-w-2xl text-center">

            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">
              Why Join
            </p>

            <h2 className="mt-2 font-[family:var(--font-display)] text-[1.45rem] font-semibold leading-[1.3] text-[color:var(--text-dark)] md:text-[1.8rem]">
              A team environment where your work directly shapes student journeys
            </h2>
          </div>

          <div className="mt-7 space-y-4">

            {values.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-[1.1rem] border border-blue-100 bg-white p-4 shadow-[0_10px_22px_rgba(15,76,129,0.04)]"
                >

                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <Icon className="size-5" />
                  </div>

                  <div>
                    <h3 className="font-[family:var(--font-display)] text-[1rem] font-semibold leading-6 text-slate-900 md:text-[1.08rem]">
                      {item.title}
                    </h3>

                    <p className="mt-1.5 text-[13px] leading-6 text-slate-600 md:text-[14px]">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}