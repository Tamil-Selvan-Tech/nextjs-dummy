import { LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { Navbar } from "@/components/navbar";

const supportEmailHref =
  "https://mail.google.com/mail/?view=cm&fs=1&to=support@collegeedwiser.com";

export default function PrivacyPolicyPage() {
  return (
    <>
      {/* HERO SECTION */}

      <section className="relative overflow-hidden font-[family:var(--font-body)] text-slate-800">

        {/* BACKGROUND */}

        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)]" />

        <div className="mesh-bg" />

        {/* IMPORTANT Z-INDEX FIX */}

        <div className="relative z-[999]">

          <Navbar />

          <div className="page-container-full px-4 pb-8 pt-5 sm:px-6 md:pb-12 md:pt-8">

            <div className="max-w-4xl">

              {/* TOP LABEL */}

              <div className="editorial-kicker text-[10px] font-semibold tracking-[0.16em]">
                <Sparkles className="size-3" />
                Privacy Policy
              </div>

              {/* HERO TITLE */}

              <h1 className="mt-4 max-w-4xl font-[family:var(--font-display)] text-[1.5rem] font-semibold leading-[1.2] text-[color:var(--text-dark)] sm:text-[1.8rem] md:text-[2.2rem]">
                Your privacy matters to College EdwiseR.
              </h1>

              {/* DESCRIPTION */}

              <p className="mt-3 max-w-3xl text-[13px] leading-6 text-[color:var(--text-muted)] md:text-[14px]">
                This website www.collegeedwiser.com is operated and owned by
                College EdwiseR Pvt Ltd. We are committed to respecting your
                online privacy and recognizing your need for appropriate
                protection of the personal information you share with us.
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

              {[
                {
                  title:
                    "Information from Cookies and Tracking Technologies",

                  body:
                    "This website utilizes cookies and other tracking technologies. A cookie is a piece of text stored by a user’s browser to improve browsing experience. Tracking technologies may record information such as URL, IP address, browser type, operating system, access time, and pages viewed to analyze trends and improve the platform experience.",
                },

                {
                  title: "Personal Information",

                  body:
                    "Users may be asked to provide personal information such as name, email address, and phone number. To access features like shortlisting colleges or using advanced platform workflows, registration may be required along with educational information such as exams, grades, ranks, and expected admission year.",
                },

                {
                  title: "Security",

                  body:
                    "We use encryption and reasonable security measures to protect your personal data. However, no online transmission is completely secure, and while we strive to protect your information, absolute security cannot be guaranteed.",
                },
              ].map((section) => (
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

              {/* NOTE */}

              <div className="border-l-2 border-[color:var(--brand-primary-soft)] pl-3">

                <p className="text-[13px] leading-6 text-slate-600 md:text-[14px]">
                  By registering, you agree to this policy. We may use submitted
                  data for analytics and may share relevant information with
                  business partners when necessary.
                </p>
              </div>
            </div>

            {/* CARD SECTION */}

            <div className="grid gap-4 rounded-[1.3rem] border border-[rgba(15,76,129,0.08)] bg-white/95 p-4 shadow-[0_10px_22px_rgba(22,50,79,0.05)] md:grid-cols-[1.1fr_0.9fr] md:p-5">

              {/* LEFT CARD */}

              <div>

                <div className="flex items-center gap-2.5">

                  <LockKeyhole className="size-5 text-[color:var(--brand-accent)]" />

                  <h2 className="font-[family:var(--font-display)] text-[1rem] font-semibold leading-tight text-[color:var(--text-dark)] md:text-[1.08rem]">
                    Privacy Promise
                  </h2>
                </div>

                <p className="mt-2 text-[13px] leading-6 text-slate-600 md:text-[14px]">
                  We collect only the information needed to support student
                  discovery, counselling follow-up, communication, and product
                  improvement.
                </p>
              </div>

              {/* RIGHT CARD */}

              <div className="md:border-l md:border-slate-200 md:pl-4">

                <div className="flex items-center gap-2.5">

                  <ShieldCheck className="size-5 text-[color:var(--brand-primary)]" />

                  <h2 className="font-[family:var(--font-display)] text-[1rem] font-semibold leading-tight text-[color:var(--text-dark)] md:text-[1.08rem]">
                    Need Help?
                  </h2>
                </div>

                <p className="mt-2 text-[13px] leading-6 text-slate-600 md:text-[14px]">
                  If you have any questions regarding our Privacy Policy,
                  feel free to contact us.
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