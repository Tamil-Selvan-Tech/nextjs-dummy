"use client";

import {
  ArrowRight,
  Building2,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  Phone,
  Sparkles,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { readCurrentUser } from "@/lib/auth-storage";
import { request } from "@/lib/api";

const accountModes = {
  student: {
    label: "Student",
    title: "Student Signup",
    subtitle: "Create your profile and find the right course faster.",
    accentClass: "from-[color:var(--brand-primary)] to-[color:var(--brand-primary-soft)]",
    badgeClass:
      "border-[rgba(15,76,129,0.12)] bg-[rgba(15,76,129,0.06)] text-[color:var(--brand-primary)]",
  },
  college: {
    label: "College",
    title: "College Signup",
    subtitle: "Register your institution and connect with interested students.",
    accentClass: "from-[color:var(--brand-support)] to-[#37a79d]",
    badgeClass:
      "border-[rgba(15,124,116,0.14)] bg-[rgba(15,124,116,0.08)] text-[color:var(--brand-support)]",
  },
} as const;

const normalizeIndianPhoneInput = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) return digits.slice(2, 12);
  return digits.slice(0, 10);
};

const isValidIndianPhone = (value: string) => /^[6-9]\d{9}$/.test(value);

function AuthIllustration({ accountType }: { accountType: "student" | "college" }) {
  if (accountType === "student") {
    return (
      <div className="relative h-[15rem] overflow-hidden rounded-[1.7rem] border border-[rgba(15,76,129,0.1)] bg-[linear-gradient(180deg,#ffffff,#eff6ff)] shadow-[0_20px_44px_rgba(22,50,79,0.08)] sm:h-[18rem]">
        <Image
          src="/student.png"
          alt="Student Signup"
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 420px, 100vw"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,20,38,0.02),rgba(7,20,38,0.16))]" />
      </div>
    );
  }

  return (
    <div className="relative h-[15rem] overflow-hidden rounded-[1.7rem] border border-[rgba(15,124,116,0.12)] bg-[linear-gradient(180deg,#fbfefc,#eef9f6)] sm:h-[18rem]">
      <div className="absolute left-8 top-8 h-20 w-20 rounded-full bg-[rgba(255,138,61,0.14)] blur-2xl" />
      <div className="absolute right-8 top-10 h-24 w-24 rounded-full bg-[rgba(60,126,182,0.14)] blur-2xl" />
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryType = searchParams.get("type") === "college" ? "college" : "student";
  const [accountType, setAccountType] = useState<"student" | "college">(queryType);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mode = accountModes[accountType];
  const loginHref = useMemo(() => `/login?type=${accountType}`, [accountType]);

  useEffect(() => {
    const currentUser = readCurrentUser();
    if (!currentUser) return;
    if (currentUser.role === "college") {
      router.replace("/college-dashboard");
      return;
    }
    router.replace("/account");
  }, [router]);

  const passwordStrength = useMemo(() => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  }, [password]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidIndianPhone(phone)) {
      setStatus({ type: "error", text: "Enter a valid 10 digit mobile number." });
      return;
    }

    setStatus(null);
    setIsLoading(true);
    try {
      const data = await request("/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone, accountType }),
      });

      setStatus({
        type: "success",
        text: data.message || "Signup successful.",
      });
      window.setTimeout(() => {
        window.location.href = loginHref;
      }, 900);
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Signup failed.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const strengthWidth = `${Math.max(passwordStrength, 1) * 20}%`;
  const strengthColor =
    passwordStrength <= 1
      ? "bg-red-400"
      : passwordStrength <= 2
        ? "bg-orange-400"
        : passwordStrength <= 3
          ? "bg-yellow-400"
          : "bg-emerald-500";
  const strengthLabel =
    passwordStrength === 0
      ? "Very Weak"
      : passwordStrength <= 1
        ? "Weak"
        : passwordStrength <= 2
          ? "Fair"
          : passwordStrength <= 3
            ? "Good"
            : "Strong";

  return (
    <section className="relative min-h-screen overflow-hidden text-[color:var(--text-dark)]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_56%,#edf5fb_100%)]" />
      <div className="mesh-bg opacity-70" />
      <div className="hero-grid absolute inset-0 opacity-[0.07]" />

      <div className="page-container relative z-10 py-6 sm:py-10">
        <div className="mx-auto grid min-h-[90vh] max-w-6xl overflow-hidden rounded-[1.8rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,251,255,0.95))] shadow-[0_30px_80px_rgba(4,12,26,0.14)] lg:grid-cols-[0.95fr_1.05fr] lg:rounded-[2.2rem]">
          <aside className="relative hidden overflow-hidden border-r border-[rgba(15,76,129,0.08)] p-6 lg:flex lg:flex-col lg:justify-between xl:p-8">
            <div className="absolute left-[-4rem] top-12 h-44 w-44 rounded-full bg-[rgba(60,126,182,0.1)] blur-3xl" />
            <div className="absolute bottom-0 right-[-3rem] h-40 w-40 rounded-full bg-[rgba(255,138,61,0.12)] blur-3xl" />
            <div className="relative z-10">
              <BrandLogo textColor="dark" className="h-10" />
              <div className={`mt-5 inline-flex rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${mode.badgeClass}`}>
                <Sparkles className="mr-2 size-3.5" />
                {mode.label} Access
              </div>
            </div>
            <div className="relative z-10 mt-10">
              <AuthIllustration accountType={accountType} />
            </div>
            <div className="relative z-10 mt-8">
              <h2 className="font-[family:var(--font-display)] text-3xl leading-none text-[color:var(--text-dark)] xl:text-4xl">
                Create your account.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-[color:var(--text-muted)]">
                Register and continue with your college discovery flow.
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
                <div
                  className={`mb-5 rounded-[1.2rem] border px-4 py-3 text-sm font-medium ${
                    status.type === "error"
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {status.text}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
                    <input type="text" value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-[1.1rem] border border-[rgba(15,76,129,0.12)] bg-white py-3 pl-10 pr-4 text-sm text-[color:var(--text-dark)] outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]" placeholder="Enter your full name" required />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
                    <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-[1.1rem] border border-[rgba(15,76,129,0.12)] bg-white py-3 pl-10 pr-4 text-sm text-[color:var(--text-dark)] outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]" placeholder="you@example.com" required />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
                    <input type="tel" value={phone} onChange={(event) => setPhone(normalizeIndianPhoneInput(event.target.value))} className="w-full rounded-[1.1rem] border border-[rgba(15,76,129,0.12)] bg-white py-3 pl-10 pr-4 text-sm text-[color:var(--text-dark)] outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]" placeholder="10 digit mobile number" required />
                  </div>
                  {phone && !isValidIndianPhone(phone) ? (
                    <p className="mt-2 text-xs font-medium text-red-600">Enter a valid 10 digit mobile number</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-[1.1rem] border border-[rgba(15,76,129,0.12)] bg-white py-3 pl-10 pr-12 text-sm text-[color:var(--text-dark)] outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]" placeholder="Create a secure password" required />
                    <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]">
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>

                  <div className="mt-3">
                    <div className="h-2 overflow-hidden rounded-full bg-[rgba(15,76,129,0.08)]">
                      <div className={`h-full rounded-full ${strengthColor}`} style={{ width: strengthWidth }} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="font-semibold text-[color:var(--text-muted)]">{strengthLabel}</span>
                      <span className="text-[color:var(--text-muted)]">{password.length}/12+</span>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 text-xs text-[color:var(--text-muted)] sm:grid-cols-2">
                    {[
                      { label: "8+ characters", ok: password.length >= 8 },
                      { label: "One uppercase", ok: /[A-Z]/.test(password) },
                      { label: "One number", ok: /[0-9]/.test(password) },
                      { label: "One symbol", ok: /[^A-Za-z0-9]/.test(password) },
                    ].map((rule) => (
                      <div key={rule.label} className="flex items-center gap-2">
                        {rule.ok ? <Check className="size-3.5 text-emerald-600" /> : <X className="size-3.5 text-slate-400" />}
                        <span>{rule.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className={`shine-button flex w-full items-center justify-center gap-2 rounded-[1.1rem] bg-gradient-to-r ${mode.accentClass} px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60`}>
                  {isLoading ? "Creating account..." : "Create Account"}
                  <ArrowRight className="size-4" />
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[color:var(--text-muted)]">
                Already have an account?{" "}
                <Link href={loginHref} className="font-semibold text-[color:var(--brand-primary)]">
                  Login
                </Link>
              </p>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}
