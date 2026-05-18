"use client";

import { Mail, MapPinHouse, Phone, Sparkles } from "lucide-react";
import { useRef } from "react";
import { Navbar } from "@/components/navbar";

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <>
      <section className="relative overflow-hidden font-[family:var(--font-body)] text-slate-800">
        
        {/* BACKGROUND */}

        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)]" />

        <div className="mesh-bg" />

        <div className="relative z-10">
          <Navbar />

          <div className="page-container-full px-4 py-6 sm:px-6 sm:py-8 md:py-10">

            <div className="grid gap-6 lg:grid-cols-[0.95fr_1fr] lg:items-start">

              {/* LEFT SIDE */}

              <div className="w-full">

                {/* TOP LABEL */}

                <div className="editorial-kicker text-[10px] font-semibold tracking-[0.16em]">
                  <Sparkles className="size-3" />
                  Contact Us
                </div>

                {/* TITLE */}

                <h1 className="mt-4 max-w-xl font-[family:var(--font-display)] text-[1.55rem] font-semibold leading-[1.2] text-[color:var(--text-dark)] sm:text-[1.8rem] md:text-[2.2rem]">
                  We&apos;d love to hear from you.
                </h1>

                {/* DESCRIPTION */}

                <p className="mt-3 max-w-lg text-[13px] leading-6 text-[color:var(--text-muted)] md:text-[14px]">
                  Reach out for admissions support, partnerships,
                  or platform guidance.
                </p>

                {/* CONTACT CARDS */}

                <div className="mt-5 space-y-3 sm:space-y-4">

                  {[
                    {
                      title: "Address",
                      text: "No.23A, Sriram Layout Rd, Saibaba Colony, Coimbatore - 641011",
                      icon: MapPinHouse,
                    },

                    {
                      title: "Phone",
                      text: "9080649970",
                      icon: Phone,
                    },

                    {
                      title: "Email",
                      text: "info@collegeedwiser.com",
                      icon: Mail,
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="flex items-start gap-3 rounded-[1rem] border border-blue-100 bg-white p-3 shadow-[0_8px_18px_rgba(15,76,129,0.04)] sm:rounded-[1.1rem] sm:p-4"
                      >

                        {/* ICON */}

                        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                          <Icon className="size-5" />
                        </div>

                        {/* CONTENT */}

                        <div className="min-w-0">

                          <h3 className="font-[family:var(--font-display)] text-[0.98rem] font-semibold leading-6 text-slate-900 md:text-[1.08rem]">
                            {item.title}
                          </h3>

                          <p className="mt-1 text-[13px] leading-6 break-words text-slate-600 md:text-[14px]">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FORM CARD */}

              <div className="rounded-[1.2rem] border border-[rgba(15,76,129,0.08)] bg-white/95 p-4 shadow-[0_10px_22px_rgba(22,50,79,0.05)] sm:p-5 md:rounded-[1.3rem]">

                {/* FORM TOP */}

                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-red-500">
                  Send Message
                </p>

                <h2 className="mt-2 font-[family:var(--font-display)] text-[1.35rem] font-semibold leading-[1.3] text-[color:var(--text-dark)] sm:text-[1.5rem] md:text-[1.8rem]">
                  Start a conversation
                </h2>

                {/* FORM */}

                <form
                  ref={formRef}
                  onSubmit={(event) => {
                    event.preventDefault();
                    formRef.current?.reset();
                  }}
                  className="mt-4 space-y-3"
                >

                  {/* NAME */}

                  <div className="rounded-[0.9rem] border border-[rgba(15,76,129,0.08)] bg-white px-4 py-3">

                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--text-muted)]">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      required
                      className="w-full bg-transparent text-[13px] font-medium text-[color:var(--text-dark)] outline-none placeholder:text-slate-400 md:text-[14px]"
                    />
                  </div>

                  {/* EMAIL */}

                  <div className="rounded-[0.9rem] border border-[rgba(15,76,129,0.08)] bg-white px-4 py-3">

                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--text-muted)]">
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      required
                      className="w-full bg-transparent text-[13px] font-medium text-[color:var(--text-dark)] outline-none placeholder:text-slate-400 md:text-[14px]"
                    />
                  </div>

                  {/* MESSAGE */}

                  <div className="rounded-[0.9rem] border border-[rgba(15,76,129,0.08)] bg-white px-4 py-3">

                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--text-muted)]">
                      Message
                    </label>

                    <textarea
                      name="message"
                      rows={4}
                      placeholder="Type your message..."
                      required
                      className="w-full resize-none bg-transparent text-[13px] font-medium leading-6 text-[color:var(--text-dark)] outline-none placeholder:text-slate-400 md:text-[14px]"
                    />
                  </div>

                  {/* BUTTON */}

                  <button
                    type="submit"
                    className="w-full rounded-[0.9rem] bg-red-500 py-3 text-[13px] font-semibold text-white transition duration-200 hover:bg-red-600 md:text-[14px]"
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