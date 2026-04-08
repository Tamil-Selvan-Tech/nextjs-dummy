import { BookOpenCheck, BriefcaseBusiness, Rocket, Sparkles, Users } from "lucide-react";
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
      <section className="relative overflow-hidden text-slate-800">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)]" />
        <div className="mesh-bg" />
        <div className="relative z-10">
          <Navbar />
          <div className="page-container-full pb-16 pt-10 px-4 sm:px-6 md:pt-14">
            <div className="max-w-4xl">
              <div className="editorial-kicker">
                <Sparkles className="size-3.5" />
                Careers
              </div>
              <h1 className="mt-6 font-[family:var(--font-display)] text-3xl font-bold leading-tight text-[color:var(--text-dark)] sm:text-[2.35rem] md:text-[2.8rem] md:whitespace-nowrap">
                Join us to build student-first products for higher education
                discovery.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[color:var(--text-muted)] md:text-[15px]">
                We are creating practical tools that connect students, colleges, and
                outcomes. If you like solving real problems with clean execution, you
                will fit right in.
              </p>
              <div className="mt-8 inline-flex items-center gap-4 rounded-[1.6rem] border border-[rgba(15,76,129,0.08)] bg-white/90 px-5 py-4 shadow-[0_16px_32px_rgba(22,50,79,0.08)]">
                <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                  <BriefcaseBusiness className="size-6" />
                </div>
                <p className="text-sm font-semibold text-[color:var(--text-dark)]">
                  Hiring for builders who care about product quality and student impact
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell page-section bg-[#f6f8ff] text-slate-800">
        <div className="page-container-full relative z-10 px-4 sm:px-6 md:pr-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
              Why Join
            </p>
            <h2 className="mt-3 text-2xl font-bold leading-tight text-[color:var(--text-dark)] md:text-[2rem]">
              A team environment where your work directly shapes student journeys
            </h2>
          </div>

          <div className="mt-10 space-y-6">
            {values.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-4 border-b border-blue-100/80 pb-6 last:border-b-0 last:pb-0">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                    <Icon className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-[family:var(--font-display)] text-xl leading-snug text-slate-900 md:text-2xl">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
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
