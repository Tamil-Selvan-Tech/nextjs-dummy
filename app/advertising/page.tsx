import { BadgeCheck, BarChart3, Megaphone, Sparkles, Target } from "lucide-react";
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
      <section className="relative overflow-hidden text-slate-800">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)]" />
        <div className="mesh-bg" />
        <div className="hero-orb one" />
        <div className="hero-orb two" />
        <div className="relative z-10">
          <Navbar />
          <div className="page-container-full px-4 pb-14 pt-8 sm:px-6 md:pb-16 md:pt-10">
            <div className="max-w-4xl">
              <div className="editorial-kicker">
                <Sparkles className="size-3.5" />
                Advertising
              </div>
              <h1 className="display-title mt-4 max-w-4xl text-[color:var(--text-dark)]">
                Promote your college to the right students with focused digital
                visibility.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--text-muted)] sm:text-base md:text-lg">
                College EdwiseR advertising solutions are designed for institutions
                that want quality reach, better intent matching, and transparent
                campaign outcomes.
              </p>
              <div className="mt-6 inline-flex items-center gap-4 rounded-[1.6rem] border border-[rgba(15,76,129,0.08)] bg-white/85 px-5 py-4 shadow-[0_18px_40px_rgba(15,76,129,0.08)]">
                <div className="rounded-2xl bg-[rgba(15,76,129,0.08)] p-3 text-[color:var(--brand-primary)]">
                  <BadgeCheck className="size-6" />
                </div>
                <p className="text-sm font-semibold text-[color:var(--text-dark)] md:text-base">
                  Built for admissions visibility and trust-led student engagement
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell page-section bg-[#f6f8ff] text-slate-800">
        <div className="page-container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
              Campaign Services
            </p>
            <h2 className="section-title mt-3">
              Advertising support focused on student intent and measurable outcomes
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {offerings.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="luxe-card group p-6">
                  <div className="inline-flex rounded-2xl bg-blue-100 p-4 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                    <Icon className="size-7" />
                  </div>
                  <h3 className="mt-5 font-[family:var(--font-display)] text-3xl leading-none text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
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
