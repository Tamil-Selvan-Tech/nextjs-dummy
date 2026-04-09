"use client";

import { ArrowRight, Clock3, Mail, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import {
  persistAuth,
  persistPendingOtpLogin,
  readPendingOtpLogin,
  type SafeAuthUser,
} from "@/lib/auth-storage";
import { request } from "@/lib/api";
import { useStatusToast } from "@/lib/toast";

const OTP_LENGTH = 6;
const OTP_DURATION_SECONDS = 5 * 60;
const RESEND_COOLDOWN_SECONDS = 5;

export default function LoginOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accountType = searchParams.get("type") || "student";
  const pendingOtpLogin = readPendingOtpLogin();
  const emailParam = searchParams.get("email") || pendingOtpLogin?.email || "";
  const redirectParam = searchParams.get("redirect");
  const defaultRedirect = accountType === "college" ? "/college-dashboard" : "/account";
  const safeRedirect =
    redirectParam && redirectParam.startsWith("/")
      ? decodeURIComponent(redirectParam)
      : defaultRedirect;

  const [otpDigits, setOtpDigits] = useState(() => Array(OTP_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(OTP_DURATION_SECONDS);
  const [resendCooldownLeft, setResendCooldownLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [status, setStatus] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  useStatusToast(status);

  useEffect(() => {
    if (!emailParam) {
      router.replace(`/login?type=${accountType}`);
    }
  }, [accountType, emailParam, router]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  useEffect(() => {
    if (resendCooldownLeft <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldownLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldownLeft]);

  const maskedEmail = useMemo(() => {
    const email = String(emailParam || "").trim();
    if (!email.includes("@")) return email || "your email";
    const [name, domain] = email.split("@");
    const visible = name.slice(0, 2);
    return `${visible}${"*".repeat(Math.max(name.length - visible.length, 1))}@${domain}`;
  }, [emailParam]);

  const formattedTime = useMemo(() => {
    const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const seconds = String(secondsLeft % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [secondsLeft]);

  const otpValue = otpDigits.join("");

  const handleDigitChange = (index: number, value: string) => {
    const nextChar = value.replace(/\D/g, "").slice(-1);
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = nextChar;
      return next;
    });
    if (nextChar && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    event.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((digit, index) => {
      next[index] = digit;
    });
    setOtpDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH) - 1]?.focus();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (otpValue.length !== OTP_LENGTH) {
      setStatus({ type: "error", text: "Enter the complete 6 digit OTP." });
      return;
    }
    if (secondsLeft <= 0) {
      setStatus({ type: "error", text: "OTP expired. Please resend OTP." });
      return;
    }

    setStatus(null);
    setIsSubmitting(true);
    try {
      const data = await request("/api/users/verify-login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailParam,
          otp: otpValue,
          accountType,
        }),
      });

      const safeUser: SafeAuthUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        role: data.user.role,
      };
      persistAuth(data.token, safeUser);
      persistPendingOtpLogin(null);
      setStatus({
        type: "success",
        text: data.message || "Login successful.",
      });
      window.setTimeout(() => router.push(safeRedirect), 1000);
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "OTP verification failed.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (isResending || resendCooldownLeft > 0) return;
    setStatus(null);
    setIsResending(true);
    try {
      const data = await request("/api/users/resend-login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailParam,
          accountType,
        }),
      });

      setIsResending(false);
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      setSecondsLeft(OTP_DURATION_SECONDS);
      setResendCooldownLeft(RESEND_COOLDOWN_SECONDS);
      inputRefs.current[0]?.focus();
      setStatus({ type: "success", text: data.message || "OTP resent successfully." });
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to resend OTP.",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden text-[color:var(--text-dark)]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_56%,#edf5fb_100%)]" />
      <div className="mesh-bg opacity-70" />
      <div className="hero-grid absolute inset-0 opacity-[0.07]" />

      <div className="page-container relative z-10 py-6 sm:py-10">
        <div className="mx-auto flex min-h-[88vh] max-w-6xl items-center justify-center">
          <div className="grid w-full max-w-5xl overflow-hidden rounded-[1.8rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,251,255,0.95))] shadow-[0_30px_80px_rgba(4,12,26,0.14)] lg:grid-cols-[0.95fr_1.05fr] lg:rounded-[2.2rem]">
            <aside className="relative hidden overflow-hidden border-r border-[rgba(15,76,129,0.08)] p-6 lg:flex lg:flex-col lg:justify-between xl:p-8">
              <div className="absolute left-[-4rem] top-12 h-44 w-44 rounded-full bg-[rgba(60,126,182,0.1)] blur-3xl" />
              <div className="absolute bottom-0 right-[-3rem] h-40 w-40 rounded-full bg-[rgba(255,138,61,0.12)] blur-3xl" />

              <div className="relative z-10">
                <BrandLogo textColor="dark" className="h-10" />
                <div className="mt-5 inline-flex rounded-full border border-[rgba(15,76,129,0.12)] bg-[rgba(15,76,129,0.06)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-primary)]">
                  <Sparkles className="mr-2 size-3.5" />
                  2-Step Verification
                </div>
              </div>

              <div className="relative z-10 rounded-[2rem] border border-[rgba(15,76,129,0.1)] bg-[linear-gradient(180deg,#ffffff,#eff6ff)] p-8 shadow-[0_22px_50px_rgba(22,50,79,0.1)]">
                <ShieldCheck className="mb-5 size-12 text-[color:var(--brand-primary)]" />
                <h2 className="font-[family:var(--font-display)] text-3xl leading-none text-[color:var(--text-dark)]">
                  Enter the 6-digit OTP sent to your email
                </h2>
                <p className="mt-4 text-sm leading-7 text-[color:var(--text-muted)]">
                  Student and college login are protected with email OTP verification.
                </p>
              </div>

              <div className="relative z-10 rounded-[1.6rem] border border-[rgba(15,76,129,0.08)] bg-white/72 p-5 shadow-[0_18px_36px_rgba(22,50,79,0.08)]">
                <div className="flex items-center gap-3 text-[color:var(--text-dark)]">
                  <ShieldCheck className="size-5 text-[color:var(--brand-primary)]" />
                  <p className="text-sm font-semibold">
                    OTP is valid for 5 minutes and must match the email used for login.
                  </p>
                </div>
              </div>
            </aside>

            <main className="flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
              <div className="w-full max-w-md sm:max-w-lg lg:max-w-md">
                <div className="text-center">
                  <BrandLogo variant="tab" className="mx-auto mb-4" />
                  <div className="mx-auto inline-flex rounded-full border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.04)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                    OTP Verification
                  </div>
                  <h2 className="mt-5 text-3xl font-bold text-[color:var(--text-dark)]">Check your email</h2>
                  <p className="mt-3 text-sm text-[color:var(--text-muted)]">
                    We sent a 6-digit OTP to{" "}
                    <span className="font-semibold text-[color:var(--text-dark)]">{maskedEmail}</span>
                  </p>
                </div>

                <div className="mt-6 rounded-[1.4rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.04)] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm text-[color:var(--text-muted)]">
                      <Mail className="size-4 text-[color:var(--brand-primary)]" />
                      Email OTP
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,76,129,0.08)] bg-white px-3 py-1 text-sm font-semibold text-[color:var(--text-dark)]">
                      <Clock3 className="size-4 text-[color:var(--brand-accent)]" />
                      {formattedTime}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  <div>
                    <label className="mb-3 block text-sm font-semibold text-[color:var(--text-dark)]">
                      Enter 6 digit OTP
                    </label>
                    <div className="flex items-center justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
                      {otpDigits.map((digit, index) => (
                        <input
                          key={`otp-${index}`}
                          ref={(element) => {
                            inputRefs.current[index] = element;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(event) => handleDigitChange(index, event.target.value)}
                          onKeyDown={(event) => handleKeyDown(index, event)}
                          className="h-13 w-10 rounded-[1rem] border border-[rgba(15,76,129,0.14)] bg-white text-center text-lg font-bold text-[color:var(--text-dark)] outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)] sm:h-15 sm:w-12 sm:text-xl"
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || secondsLeft <= 0}
                    className="shine-button flex w-full items-center justify-center gap-2 rounded-[1.1rem] bg-[color:var(--brand-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Verifying OTP..." : "Verify OTP"}
                    <ArrowRight className="size-4" />
                  </button>
                </form>

                <div className="mt-5 flex flex-col gap-3 text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending || resendCooldownLeft > 0}
                    className="text-sm font-semibold text-[color:var(--brand-primary)] transition hover:text-[color:var(--brand-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isResending
                      ? "Resending OTP..."
                      : resendCooldownLeft > 0
                        ? `Resend OTP in ${resendCooldownLeft}s`
                        : "Resend OTP"}
                  </button>
                  <Link
                    href={`/login?type=${accountType}`}
                    className="text-sm font-medium text-[color:var(--text-muted)] transition hover:text-[color:var(--brand-primary)]"
                  >
                    Back to login
                  </Link>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </section>
  );
}
