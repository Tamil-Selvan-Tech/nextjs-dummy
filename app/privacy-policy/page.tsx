import { LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { Navbar } from "@/components/navbar";

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="relative overflow-hidden text-slate-800">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)]" />
        <div className="mesh-bg" />
        <div className="relative z-10">
          <Navbar />
          <div className="page-container pb-16 pt-10 md:pt-14">
            <div className="max-w-4xl">
              <div className="editorial-kicker">
                <Sparkles className="size-3.5" />
                Privacy Policy
              </div>
              <h1 className="mt-6 max-w-3xl font-[family:var(--font-display)] text-3xl font-bold leading-tight text-[color:var(--text-dark)] sm:text-[2.35rem] md:text-[2.8rem]">
                Your privacy matters to College EdwiseR.
              </h1>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-[color:var(--text-muted)] md:text-[15px]">
                This website www.collegeedwiser.com is operated and owned by College
                EdwiseR Pvt Ltd. We are committed to respecting your online privacy and
                recognizing your need for appropriate protection of the personal
                information you share with us.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell page-section bg-[color:var(--surface-base)] text-slate-800">
        <div className="page-container relative z-10">
          <div className="space-y-8">
            <div className="space-y-6">
              {[
                {
                  title: "Information from Cookies and Tracking Technologies",
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
                <div key={section.title} className="border-b border-slate-200 pb-5 last:border-b-0 last:pb-0">
                  <h2 className="text-xl font-semibold leading-tight text-[color:var(--text-dark)] md:text-2xl">
                    {section.title}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-slate-600 md:text-[15px]">
                    {section.body}
                  </p>
                </div>
              ))}

              <div className="border-l-2 border-[color:var(--brand-primary-soft)] pl-4">
                <p className="text-sm leading-6 text-slate-600 md:text-[15px]">
                  By registering, you agree to this policy. We may use submitted data
                  for analytics and may share relevant information with business
                  partners when necessary.
                </p>
              </div>
            </div>

            <div className="grid gap-4 rounded-[1.6rem] border border-[rgba(15,76,129,0.08)] bg-white/85 p-5 shadow-[0_18px_40px_rgba(22,50,79,0.08)] md:grid-cols-[1.1fr_0.9fr] md:p-6">
              <div>
                <div className="flex items-center gap-3">
                  <LockKeyhole className="size-6 text-[color:var(--brand-accent)]" />
                  <h2 className="font-[family:var(--font-display)] text-xl leading-tight text-[color:var(--text-dark)] md:text-2xl">
                    Privacy Promise
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  We collect only the information needed to support student discovery,
                  counselling follow-up, communication, and product improvement.
                </p>
              </div>
              <div className="md:border-l md:border-slate-200 md:pl-5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="size-6 text-[color:var(--brand-primary)]" />
                  <h2 className="font-[family:var(--font-display)] text-xl leading-tight text-[color:var(--text-dark)] md:text-2xl">
                    Need Help?
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  If you have any questions regarding our Privacy Policy, feel free to
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
