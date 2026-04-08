import { AlertTriangle, Sparkles } from "lucide-react";
import { Navbar } from "@/components/navbar";

const sections = [
  {
    title: "Educational Information Disclaimer",
    body:
      "College information, admission processes, fees, rankings, eligibility criteria, average salary, and syllabus details may change from time to time. The information provided is for general reference purposes only. Users are advised to verify all details directly with the respective colleges or official authorities before making any decisions.",
  },
  {
    title: "Image Disclaimer",
    body:
      "Images used on this website are for representative purposes only. For accurate and official visuals, please refer to the respective college’s official website.",
  },
  {
    title: "External Links Disclaimer",
    body:
      "The website may contain links to third-party websites or content belonging to or originating from third parties. Such external links are not monitored or checked for accuracy, adequacy, validity, reliability, or completeness by us.",
  },
  {
    title: "No Professional Advice",
    body:
      "The information provided on this website does not constitute professional counseling, legal, financial, or academic advice. You should consult appropriate professionals before taking any action based on information available on this website.",
  },
  {
    title: "Limitation of Liability",
    body:
      "Under no circumstance shall College EdwiseR Pvt Ltd be liable for any loss or damage incurred as a result of the use of the website or reliance on any information provided. Your use of the platform and your reliance on any information is solely at your own risk.",
  },
];

export default function DisclaimerPage() {
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
                Disclaimer
              </div>
              <h1 className="display-title mt-6 text-[color:var(--text-dark)] md:whitespace-nowrap">
                Information is provided for general guidance purposes.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--text-muted)] md:text-lg">
                The information provided on www.collegeedwiser.com is offered in good
                faith for general informational use. We make no representation or
                warranty regarding the accuracy, adequacy, validity, reliability,
                availability, or completeness of any information shown on the platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell page-section bg-[color:var(--surface-base)] text-slate-800">
        <div className="page-container-full relative z-10 px-4 sm:px-6 md:pr-16">
          <div className="space-y-8">
            <div className="space-y-6">
              {sections.map((section) => (
                <div key={section.title} className="border-b border-slate-200 pb-5 last:border-b-0 last:pb-0">
                  <h2 className="text-2xl font-semibold text-[color:var(--text-dark)]">
                    {section.title}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 rounded-[1.6rem] border border-[rgba(15,76,129,0.08)] bg-white/85 p-5 shadow-[0_18px_40px_rgba(22,50,79,0.08)] md:grid-cols-[1.1fr_0.9fr] md:p-6">
              <div>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="size-6 text-[color:var(--brand-accent)]" />
                  <h2 className="font-[family:var(--font-display)] text-xl leading-tight text-[color:var(--text-dark)] md:text-2xl">
                    Important Note
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Always confirm final admission details, fees, scholarship rules,
                  placement data, and official instructions directly with the
                  respective institution or authority.
                </p>
              </div>
              <div className="md:border-l md:border-slate-200 md:pl-5">
                <h2 className="font-[family:var(--font-display)] text-xl leading-tight text-[color:var(--text-dark)] md:text-2xl">
                  Have Questions?
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  If you have any questions regarding our Disclaimer, feel free to
                  contact us.
                </p>
                <p className="mt-4 text-base font-semibold text-[color:var(--brand-primary)]">
                  support@collegeedwiser.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
