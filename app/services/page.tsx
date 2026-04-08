import { BanknoteArrowDown, BriefcaseBusiness, FolderKanban, Landmark, Sparkles } from "lucide-react";
import { Navbar } from "@/components/navbar";

const services = [
  {
    title: "Funding Assistance",
    description:
      "Guidance to help students explore education funding support, scholarships, and practical financial pathways for higher studies.",
    icon: BanknoteArrowDown,
  },
  {
    title: "Internships",
    description:
      "Industry-linked internship opportunities that help students build workplace exposure, confidence, and employability while studying.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Academic Projects",
    description:
      "Support for academic and industry-oriented project work so students can apply classroom learning to real-world problem solving.",
    icon: FolderKanban,
  },
  {
    title: "Government Schemes",
    description:
      "Access to awareness and guidance around relevant government schemes that can benefit students in education and career development.",
    icon: Landmark,
  },
];

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
                Student support services designed to connect education with real
                industry outcomes.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[color:var(--text-muted)] md:text-[15px]">
                We help students move beyond admission discovery through funding,
                practical experience, guided projects, and public support programs.
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
              Practical services that support both academic growth and career readiness
            </h2>
          </div>

          <div className="mt-10 space-y-6">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div key={service.title} className="flex flex-col gap-3 border-b border-emerald-100/80 pb-6 last:border-b-0 last:pb-0 md:flex-row md:items-start">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(15,124,116,0.12)] text-[color:var(--brand-support)]">
                    <Icon className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-[family:var(--font-display)] text-xl leading-snug text-[color:var(--text-dark)] md:text-2xl">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {service.description}
                    </p>
                  </div>
                </div>
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
              The platform supports students with opportunities that link learning to real-world progress.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--text-muted)] md:text-[15px]">
              College EdwiseR brings together college guidance and industry-facing support
              so students can build stronger academic confidence and career exposure.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
