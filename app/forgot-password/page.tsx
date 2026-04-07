"use client";

import { ArrowLeft, Mail, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { request } from "@/lib/api";
import { useStatusToast } from "@/lib/toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "error" | "success"; text: string } | null>(null);
  useStatusToast(status);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsLoading(true);

    try {
      const data = await request("/api/users/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      setStatus({
        type: "success",
        text: data.message || "If your email exists, a reset link will be sent.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to send reset link.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden text-[color:var(--text-dark)]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_56%,#edf5fb_100%)]" />
      <div className="mesh-bg opacity-70" />

      <div className="page-container relative z-10 py-6 sm:py-10">
        <div className="mx-auto grid min-h-[88vh] max-w-6xl overflow-hidden rounded-[2.2rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,251,255,0.95))] shadow-[0_30px_80px_rgba(4,12,26,0.14)] lg:grid-cols-[0.95fr_1.05fr]">
          <aside className="relative hidden overflow-hidden border-r border-[rgba(15,76,129,0.08)] p-8 lg:flex lg:flex-col lg:justify-between">
            <div className="absolute left-[-4rem] top-12 h-44 w-44 rounded-full bg-[rgba(60,126,182,0.1)] blur-3xl" />
            <div className="absolute bottom-0 right-[-3rem] h-40 w-40 rounded-full bg-[rgba(255,138,61,0.12)] blur-3xl" />
            <div className="relative z-10">
              <BrandLogo textColor="dark" className="h-10" />
              <div className="mt-5 inline-flex rounded-full border border-[rgba(15,76,129,0.12)] bg-[rgba(15,76,129,0.06)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-primary)]">
                <Sparkles className="mr-2 size-3.5" />
                Account Recovery
              </div>
            </div>

            <div className="relative z-10 rounded-[2rem] border border-[rgba(15,76,129,0.1)] bg-[linear-gradient(180deg,#ffffff,#eff6ff)] p-8 shadow-[0_22px_50px_rgba(22,50,79,0.1)]">
              <ShieldCheck className="mb-5 size-12 text-[color:var(--brand-primary)]" />
              <h2 className="font-[family:var(--font-display)] text-3xl leading-none text-[color:var(--text-dark)]">
                Account Recovery
              </h2>
              <p className="mt-4 text-sm leading-7 text-[color:var(--text-muted)]">
                Enter your registered email and we will send instructions to reset
                your password securely.
              </p>
            </div>

            <p className="relative z-10 max-w-sm text-sm leading-7 text-[color:var(--text-muted)]">
              Same home page tone, softer gradients, and a clearer password recovery
              flow for students and colleges.
            </p>
          </aside>

          <main className="flex items-center justify-center p-5 sm:p-8 lg:p-12">
            <div className="w-full max-w-md">
              <div className="mb-7 text-center">
                <BrandLogo variant="tab" className="mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-[color:var(--text-dark)]">Forgot Password</h1>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                  Enter your email to receive a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-[1.1rem] border border-[rgba(15,76,129,0.12)] bg-white py-3 pl-10 pr-4 text-sm text-[color:var(--text-dark)] outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="shine-button flex w-full items-center justify-center gap-2 rounded-[1.1rem] bg-[color:var(--brand-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--brand-primary)] transition hover:text-[color:var(--brand-primary-soft)]"
              >
                <ArrowLeft className="size-4" />
                Back to login
              </Link>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}
