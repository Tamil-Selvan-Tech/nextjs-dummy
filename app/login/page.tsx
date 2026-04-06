"use client";

import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import {
  persistAuth,
  persistPendingOtpLogin,
  readCurrentUser,
  type SafeAuthUser,
} from "@/lib/auth-storage";
import { request } from "@/lib/api";

const accountModes = {
  student: {
    label: "Student",
    title: "Student Login",
    subtitle: "Explore colleges, compare courses, and submit enquiries.",
    accentClass: "from-[color:var(--brand-primary)] to-[color:var(--brand-primary-soft)]",
    badgeClass:
      "border-[rgba(15,76,129,0.12)] bg-[rgba(15,76,129,0.06)] text-[color:var(--brand-primary)]",
  },
  college: {
    label: "College",
    title: "College Login",
    subtitle: "Access college profile activity and student enquiry updates.",
    accentClass: "from-[color:var(--brand-support)] to-[#37a79d]",
    badgeClass:
      "border-[rgba(15,124,116,0.14)] bg-[rgba(15,124,116,0.08)] text-[color:var(--brand-support)]",
  },
} as const;

function StudentIllustration() {
  return (
    <div className="relative h-[15rem] overflow-hidden rounded-[1.7rem] border border-[rgba(15,76,129,0.1)] bg-[linear-gradient(180deg,#ffffff,#eff6ff)] shadow-[0_20px_44px_rgba(22,50,79,0.08)] sm:h-[18rem]">
      <Image
        src="/student.png"
        alt="Student Login"
        fill
        className="object-cover"
        sizes="(min-width: 1024px) 420px, 100vw"
        priority
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,20,38,0.02),rgba(7,20,38,0.16))]" />
      <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)] shadow-[0_14px_34px_rgba(22,50,79,0.12)]">
        <GraduationCap className="size-4" />
        Student Portal
      </div>
    </div>
  );
}

function CollegeIllustration() {
  return (
    <div className="relative h-[15rem] overflow-hidden rounded-[1.7rem] border border-[rgba(15,124,116,0.12)] bg-[linear-gradient(180deg,#fbfefc,#eef9f6)] sm:h-[18rem]">
      <div className="absolute inset-x-6 bottom-8 h-3 rounded-full bg-[rgba(15,124,116,0.12)] blur-md" />
      <div className="absolute left-1/2 top-8 h-0 w-0 -translate-x-1/2 border-x-[7rem] border-b-[2.6rem] border-x-transparent border-b-[color:var(--brand-support)]" />
      <div className="absolute left-1/2 top-24 h-32 w-[15rem] -translate-x-1/2 rounded-[1.4rem] bg-white shadow-[0_20px_44px_rgba(15,124,116,0.14)]" />
      <div className="absolute left-[26%] top-[7.6rem] grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <span key={index} className="h-8 w-8 rounded-md bg-[rgba(15,124,116,0.16)]" />
        ))}
      </div>
      <div className="absolute left-1/2 top-[12.3rem] h-16 w-12 -translate-x-1/2 rounded-t-xl bg-[color:var(--brand-support)]" />
      <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/60 bg-white/78 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-support)] shadow-[0_14px_34px_rgba(15,124,116,0.12)]">
        <Building2 className="size-4" />
        College Portal
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawType = searchParams.get("type");
  const queryType = rawType === "college" ? "college" : "student";
  const [accountType, setAccountType] = useState<"student" | "college">(queryType);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const mode = accountModes[accountType];
  const Illustration = accountType === "college" ? CollegeIllustration : StudentIllustration;
  const signupHref = useMemo(() => `/signup?type=${accountType}`, [accountType]);

  useEffect(() => {
    const currentUser = readCurrentUser();
    if (!currentUser) return;
    if (currentUser.role === "admin") {
      router.replace("/admin");
      return;
    }
    if (currentUser.role === "college") {
      router.replace("/college-dashboard");
      return;
    }
    router.replace("/account");
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsLoading(true);

    try {
      const data = await request("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, accountType }),
      });

      if (data?.token && data?.user?.role === "admin") {
        persistAuth(data.token, {
          id: String(data.user.id || "admin"),
          name: data.user.name || "Admin",
          email: data.user.email || email.trim(),
          role: "admin",
        } as SafeAuthUser);

        persistPendingOtpLogin(null);
        setStatus({
          type: "success",
          text: data.message || "Admin login successful.",
        });
        router.push("/admin");
        return;
      }

      if (data.requiresOtp) {
        persistPendingOtpLogin({
          email: data.email,
          role: data.role,
          accountType,
        });
        const params = new URLSearchParams();
        params.set("type", accountType);
        params.set("email", data.email);
        const redirect = searchParams.get("redirect");
        if (redirect && redirect.startsWith("/")) {
          params.set("redirect", redirect);
        } else if (accountType === "college") {
          params.set("redirect", "/college-dashboard");
        } else {
          params.set("redirect", "/account");
        }
        router.push(`/login-otp?${params.toString()}`);
        return;
      }

      if (data?.token && data?.user) {
        persistAuth(data.token, {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          role: data.user.role,
        });
      }

      setStatus({
        type: "success",
        text: data.message || "Login successful.",
      });
      router.push(accountType === "college" ? "/college-dashboard" : "/account");
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Login failed.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden text-[color:var(--text-dark)]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_56%,#edf5fb_100%)]" />
      <div className="mesh-bg opacity-70" />
      <div className="hero-grid absolute inset-0 opacity-[0.07]" />

      <div className="page-container relative z-10 py-6 sm:py-10">
        <div className="mx-auto grid min-h-[88vh] max-w-6xl overflow-hidden rounded-[1.8rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,251,255,0.95))] shadow-[0_30px_80px_rgba(4,12,26,0.14)] lg:grid-cols-[0.95fr_1.05fr] lg:rounded-[2.2rem]">
          <aside className="relative hidden overflow-hidden border-r border-[rgba(15,76,129,0.08)] p-6 lg:flex lg:flex-col lg:justify-between xl:p-8">
            <div className="absolute left-[-4rem] top-12 h-44 w-44 rounded-full bg-[rgba(60,126,182,0.1)] blur-3xl" />
            <div className="absolute bottom-0 right-[-3rem] h-40 w-40 rounded-full bg-[rgba(255,138,61,0.12)] blur-3xl" />
            <div className="relative z-10">
              <BrandLogo textColor="dark" className="h-10" />
              <div className={`mt-5 inline-flex rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${mode.badgeClass}`}>
                {mode.label} Access
              </div>
            </div>
            <div className="relative z-10 mt-10">
              <Illustration />
            </div>
            <div className="relative z-10 mt-8">
              <h2 className="font-[family:var(--font-display)] text-3xl leading-none text-[color:var(--text-dark)] xl:text-4xl">
                Welcome back.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-[color:var(--text-muted)]">
                Sign in to continue your college discovery journey. Admin accounts can also use this form.
              </p>
            </div>
          </aside>

          <main className="flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
            <div className="w-full max-w-md sm:max-w-lg lg:max-w-md">
              <div className="mb-7 text-center">
                <BrandLogo variant="tab" className="mx-auto mb-4" />

                <div className="mb-5 flex justify-center">
                  <div className="inline-flex rounded-full border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.04)] p-1">
                    <button
                      type="button"
                      onClick={() => setAccountType("student")}
                      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-semibold transition sm:px-5 ${
                        accountType === "student"
                          ? "bg-[color:var(--brand-primary)] text-white"
                          : "text-[color:var(--text-muted)] hover:bg-white"
                      }`}
                    >
                      <GraduationCap className="size-4" />
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType("college")}
                      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-semibold transition sm:px-5 ${
                        accountType === "college"
                          ? "bg-[color:var(--brand-support)] text-white"
                          : "text-[color:var(--text-muted)] hover:bg-white"
                      }`}
                    >
                      <Building2 className="size-4" />
                      College
                    </button>
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-[color:var(--text-dark)]">{mode.title}</h1>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">{mode.subtitle}</p>
              </div>

              {status ? (
                <div className="mb-5 rounded-[1.2rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {status.text}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full rounded-[1.1rem] border border-[rgba(15,76,129,0.12)] bg-white py-3 pl-10 pr-4 text-sm text-[color:var(--text-dark)] outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="login-password" className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full rounded-[1.1rem] border border-[rgba(15,76,129,0.12)] bg-white py-3 pl-10 pr-12 text-sm text-[color:var(--text-dark)] outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <Link href="/forgot-password" className="font-semibold text-[color:var(--brand-primary)] transition hover:text-[color:var(--brand-primary-soft)]">
                    Forgot Password?
                  </Link>
                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="text-[color:var(--text-muted)] transition hover:text-[color:var(--brand-primary)]"
                  >
                    Back to Home
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`shine-button flex w-full items-center justify-center gap-2 rounded-[1.1rem] bg-gradient-to-r ${mode.accentClass} px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {isLoading ? "Signing in..." : "Login"}
                  <ArrowRight className="size-4" />
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[color:var(--text-muted)]">
                Don&apos;t have an account?{" "}
                <Link href={signupHref} className="font-semibold text-[color:var(--brand-primary)]">
                  Create one
                </Link>
              </p>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}
