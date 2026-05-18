import { AlertTriangle, Sparkles } from "lucide-react";
import { Navbar } from "@/components/navbar";

const supportEmailHref =
  "https://mail.google.com/mail/?view=cm&fs=1&to=support@collegeedwiser.com";

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
      {/* HERO SECTION */}

      <section className="relative overflow-hidden font-[family:var(--font-body)] text-slate-800">

        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)]" />

        <div className="mesh-bg" />

        {/* z-0 IMPORTANT FIX */}
        
<div className="relative z-[999]">
          <Navbar />

          <div className="page-container-full px-4 pb-8 pt-5 sm:px-6 md:pb-12 md:pt-8">

            <div className="max-w-4xl">

              {/* TOP LABEL */}

              <div className="editorial-kicker text-[10px] font-semibold tracking-[0.16em]">
                <Sparkles className="size-3" />
                Disclaimer
              </div>

              {/* HERO TITLE */}

              <h1 className="mt-4 max-w-4xl font-[family:var(--font-display)] text-[1.5rem] font-semibold leading-[1.2] text-[color:var(--text-dark)] sm:text-[1.8rem] md:text-[2.2rem]">
                Information is provided for general guidance purposes.
              </h1>

              {/* DESCRIPTION */}

              <p className="mt-3 max-w-3xl text-[13px] leading-6 text-[color:var(--text-muted)] md:text-[14px]">
                The information provided on www.collegeedwiser.com is offered in
                good faith for general informational use. We make no representation
                or warranty regarding the accuracy, adequacy, validity,
                reliability, availability, or completeness of any information
                shown on the platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECOND SECTION */}

<section className="section-shell page-section relative z-10 bg-[color:var(--surface-base)] font-[family:var(--font-body)] text-slate-800">
<div className="page-container-full relative z-10 px-4 sm:px-6 md:px-8">
          <div className="space-y-6">

            {/* CONTENT */}

            <div className="space-y-5">

              {sections.map((section) => (
                <div
                  key={section.title}
                  className="border-b border-slate-200 pb-4 last:border-b-0 last:pb-0"
                >

                  <h2 className="font-[family:var(--font-display)] text-[1rem] font-semibold leading-6 text-[color:var(--text-dark)] md:text-[1.08rem]">
                    {section.title}
                  </h2>

                  <p className="mt-1.5 text-[13px] leading-6 text-slate-600 md:text-[14px]">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>

            {/* BOTTOM CARD */}

            <div className="grid gap-4 rounded-[1.2rem] border border-[rgba(15,76,129,0.08)] bg-white/95 p-4 shadow-[0_10px_22px_rgba(22,50,79,0.05)] md:grid-cols-[1.1fr_0.9fr] md:p-5">

              {/* LEFT */}

              <div>

                <div className="flex items-center gap-2.5">

                  <AlertTriangle className="size-5 text-[color:var(--brand-accent)]" />

                  <h2 className="font-[family:var(--font-display)] text-[1rem] font-semibold leading-tight text-[color:var(--text-dark)] md:text-[1.08rem]">
                    Important Note
                  </h2>
                </div>

                <p className="mt-2 text-[13px] leading-6 text-slate-600 md:text-[14px]">
                  Always confirm final admission details, fees, scholarship
                  rules, placement data, and official instructions directly with
                  the respective institution or authority.
                </p>
              </div>

              {/* RIGHT */}

              <div className="md:border-l md:border-slate-200 md:pl-4">

                <h2 className="font-[family:var(--font-display)] text-[1rem] font-semibold leading-tight text-[color:var(--text-dark)] md:text-[1.08rem]">
                  Have Questions?
                </h2>

                <p className="mt-2 text-[13px] leading-6 text-slate-600 md:text-[14px]">
                  If you have any questions regarding our Disclaimer, feel free
                  to contact us.
                </p>

                <a
                  href={supportEmailHref}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex break-all text-[13px] font-semibold text-[color:var(--brand-primary)] transition hover:text-[color:var(--brand-primary-soft)] md:text-[14px]"
                >
                  support@collegeedwiser.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}