"use client";

import { Mail, MapPinHouse, Phone, Sparkles } from "lucide-react";
import { useRef } from "react";
import { Navbar } from "@/components/navbar";

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <>
      <section className="relative overflow-hidden text-slate-800">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)]" />
        <div className="mesh-bg" />
        <div className="relative z-10">
          <Navbar />

          <div className="page-container-full py-14 px-4 sm:px-6 md:py-18">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <div className="editorial-kicker">
                  <Sparkles className="size-3.5" />
                  Contact Us
                </div>
                <h1 className="mt-6 max-w-3xl font-[family:var(--font-display)] text-3xl font-bold leading-tight text-[color:var(--text-dark)] sm:text-[2.35rem] md:text-[2.8rem]">
                  We&apos;d love to hear from you. Reach out using the details below.
                </h1>
                <p className="mt-5 max-w-xl text-sm leading-7 text-[color:var(--text-muted)] md:text-[15px]">
                  Let&apos;s make student support feel more personal and more premium,
                  whether you&apos;re asking about admissions, partnerships, or platform
                  guidance.
                </p>

                <div className="mt-8 space-y-4">
                  {[
                    {
                      title: "Address",
                      text: "No.23A, Sriram Layout Rd, Saibaba Colony, Coimbatore, Tamil Nadu - 641 011",
                      icon: MapPinHouse,
                    },
                    { title: "Phone", text: "9080649970", icon: Phone },
                    { title: "Email", text: "info@collegeedwiser.com", icon: Mail },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="flex items-start gap-4 border-b border-[rgba(15,76,129,0.1)] pb-4 last:border-b-0 last:pb-0">
                        <div className="rounded-2xl bg-[rgba(255,138,61,0.12)] p-3 text-[color:var(--brand-accent-deep)]">
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-[color:var(--text-dark)] md:text-lg">{item.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-[color:var(--text-muted)]">{item.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[2rem] border border-[rgba(15,76,129,0.1)] bg-white/90 p-5 shadow-[0_18px_40px_rgba(22,50,79,0.08)] md:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-primary)]">
                  Send Message
                </p>
                <h2 className="mt-3 font-[family:var(--font-display)] text-2xl leading-tight text-[color:var(--text-dark)] md:text-[2rem]">
                  Start a conversation
                </h2>

                <form
                  ref={formRef}
                  onSubmit={(event) => {
                    event.preventDefault();
                    formRef.current?.reset();
                  }}
                  className="mt-8 space-y-5"
                >
                  <div className="rounded-[1.4rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3.5">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      required
                      className="w-full bg-transparent text-sm text-[color:var(--text-dark)] outline-none placeholder:text-slate-400"
                    />
                  </div>
                  <div className="rounded-[1.4rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3.5">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      required
                      className="w-full bg-transparent text-sm text-[color:var(--text-dark)] outline-none placeholder:text-slate-400"
                    />
                  </div>
                  <div className="rounded-[1.4rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3.5">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
                      Message
                    </label>
                    <textarea
                      name="message"
                      rows={5}
                      placeholder="Type your message..."
                      required
                      className="w-full resize-none bg-transparent text-sm text-[color:var(--text-dark)] outline-none placeholder:text-slate-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="shine-button w-full rounded-[1.4rem] bg-[color:var(--brand-accent)] py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-[color:var(--brand-accent-deep)]"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
