"use client";

import {
  ArrowLeft,
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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { Suspense, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import {
  persistAuth,
  persistPendingOtpLogin,
  readCurrentUser,
  type SafeAuthUser,
} from "@/lib/auth-storage";
import { request } from "@/lib/api";
import { navigateToSafeBack } from "@/lib/safe-back";
import { useStatusToast } from "@/lib/toast";

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

function GoogleMark({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.39a4.61 4.61 0 0 1-2 3.02v2.5h3.23c1.89-1.73 2.98-4.28 2.98-7.35Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.61-2.42l-3.23-2.5c-.9.6-2.05.95-3.38.95-2.6 0-4.8-1.75-5.59-4.1H3.08v2.58A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC04"
        d="M6.41 13.93A5.99 5.99 0 0 1 6.1 12c0-.67.12-1.31.31-1.93V7.5H3.08A10 10 0 0 0 2 12c0 1.61.39 3.14 1.08 4.5l3.33-2.57Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.97c1.47 0 2.8.51 3.84 1.5l2.88-2.88C16.95 2.94 14.7 2 12 2A10 10 0 0 0 3.08 7.5l3.33 2.57C7.2 7.72 9.4 5.97 12 5.97Z"
      />
    </svg>
  );
}

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleButtonConfiguration = {
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?:
    | "signin_with"
    | "signup_with"
    | "continue_with"
    | "signin"
    | "continue";
  shape?: "rectangular" | "pill" | "circle" | "square";
  width?: number;
  logo_alignment?: "left" | "center";
};

type GoogleIdConfiguration = {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
};

type GoogleAccountsIdApi = {
  initialize: (config: GoogleIdConfiguration) => void;
  renderButton: (parent: HTMLElement, options: GoogleButtonConfiguration) => void;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleAccountsIdApi;
      };
    };
  }
}

function StudentIllustration() {
  return (
    <div className="relative h-[26rem] overflow-hidden rounded-[1.7rem] border border-[rgba(15,76,129,0.1)] bg-[linear-gradient(180deg,#ffffff,#eff6ff)] shadow-[0_20px_44px_rgba(22,50,79,0.08)] sm:h-[30rem]">
      <Image
        src="/stu.png"
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
    <div className="relative h-[26rem] overflow-hidden rounded-[1.7rem] border border-[rgba(15,124,116,0.12)] bg-[linear-gradient(180deg,#fbfefc,#eef9f6)] shadow-[0_20px_44px_rgba(15,124,116,0.08)] sm:h-[30rem]">
      
      <Image
        src="/collimg.png"
        alt="College Portal"
        fill
        className="object-cover"
        sizes="(min-width: 1024px) 420px, 100vw"
        priority
      />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,20,38,0.02),rgba(7,20,38,0.16))]" />

      <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/60 bg-white/78 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#158A84] shadow-[0_14px_34px_rgba(15,124,116,0.12)]">
        <Building2 className="size-4" />
        College Portal
      </div>
    </div>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawType = searchParams.get("type");
  const queryType = rawType === "college" ? "college" : "student";
  const [accountType, setAccountType] = useState<"student" | "college">(queryType);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGoogleScriptReady, setIsGoogleScriptReady] = useState(false);
  const [googleButtonWidth, setGoogleButtonWidth] = useState(0);
  const [status, setStatus] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const googleButtonShellRef = useRef<HTMLDivElement | null>(null);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  useStatusToast(status);

  const mode = accountModes[accountType];
  const Illustration = accountType === "college" ? CollegeIllustration : StudentIllustration;
  const signupHref = useMemo(() => `/signup?type=${accountType}`, [accountType]);
  const defaultRedirect = useMemo(
    () => (accountType === "college" ? "/college-dashboard" : "/account"),
    [accountType],
  );
  const currentRoute = useMemo(() => {
    if (!pathname) return "/";
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

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

  const redirectToOtpStep = (otpEmail: string, role: string) => {
    persistPendingOtpLogin({
      email: otpEmail,
      role,
      accountType,
    });
    const params = new URLSearchParams();
    params.set("type", accountType);
    params.set("email", otpEmail);
    const redirect = searchParams.get("redirect");
    if (redirect && redirect.startsWith("/")) {
      params.set("redirect", redirect);
    } else {
      params.set("redirect", defaultRedirect);
    }
    router.push(`/login-otp?${params.toString()}`);
  };

  const handleGoogleCredentialResponse = useEffectEvent(
    async (googleResponse: GoogleCredentialResponse) => {
      const credential = String(googleResponse?.credential || "").trim();
      if (!credential) {
        setStatus({
          type: "error",
          text: "Google sign-in did not return a valid credential.",
        });
        return;
      }

      setStatus(null);
      setIsGoogleLoading(true);

      try {
        const data = await request<{
          message?: string;
          requiresOtp?: boolean;
          email?: string;
          role?: string;
        }>("/api/users/login/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential, accountType }),
        });

        if (data.requiresOtp && data.email && data.role) {
          redirectToOtpStep(data.email, data.role);
          return;
        }

        setStatus({
          type: "error",
          text: data.message || "Google sign-in could not continue.",
        });
      } catch (error) {
        setStatus({
          type: "error",
          text: error instanceof Error ? error.message : "Google sign-in failed.",
        });
      } finally {
        setIsGoogleLoading(false);
      }
    },
  );

  useEffect(() => {
    if (window.google?.accounts?.id) {
      setIsGoogleScriptReady(true);
    }
  }, []);

  useEffect(() => {
    if (!googleClientId || !googleButtonShellRef.current) {
      return;
    }

    const shell = googleButtonShellRef.current;
    const syncGoogleButtonWidth = () => {
      const nextWidth = Math.round(Math.max(188, Math.min(280, shell.offsetWidth || 0)));
      setGoogleButtonWidth((current) => (current === nextWidth ? current : nextWidth));
    };

    syncGoogleButtonWidth();

    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(syncGoogleButtonWidth) : null;
    observer?.observe(shell);
    window.addEventListener("resize", syncGoogleButtonWidth);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", syncGoogleButtonWidth);
    };
  }, []);

  useEffect(() => {
    if (!googleClientId || !isGoogleScriptReady || !googleButtonRef.current || !googleButtonWidth) {
      return;
    }

    const googleAccountsId = window.google?.accounts?.id;
    if (!googleAccountsId) {
      return;
    }

    googleAccountsId.initialize({
      client_id: googleClientId,
      callback: handleGoogleCredentialResponse,
    });

    googleButtonRef.current.innerHTML = "";
    googleAccountsId.renderButton(googleButtonRef.current, {
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "rectangular",
      width: googleButtonWidth,
      logo_alignment: "left",
    });
  }, [googleButtonWidth, isGoogleScriptReady]);

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
        redirectToOtpStep(data.email, data.role);
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
    <section className="relative min-h-screen overflow-x-hidden text-[color:var(--text-dark)]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_56%,#edf5fb_100%)]" />
      <div className="mesh-bg opacity-70" />
      <div className="hero-grid absolute inset-0 opacity-[0.07]" />

      <div className="page-container relative z-10 py-6 sm:py-10">
        <div className="mx-auto grid min-h-[88vh] max-w-6xl overflow-visible rounded-[1.8rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,251,255,0.95))] shadow-[0_30px_80px_rgba(4,12,26,0.14)] lg:grid-cols-[0.95fr_1.05fr] lg:rounded-[2.2rem]">
          <aside className="relative hidden overflow-visible border-r border-[rgba(15,76,129,0.08)] p-6 lg:flex lg:flex-col lg:justify-between xl:p-8">
            <div className="absolute left-[-4rem] top-12 h-44 w-44 rounded-full bg-[rgba(60,126,182,0.1)] blur-3xl" />
            <div className="absolute bottom-0 right-[-3rem] h-40 w-40 rounded-full bg-[rgba(255,138,61,0.12)] blur-3xl" />
            <div className="relative z-10 flex items-center gap-4">
              <BrandLogo textColor="dark" className="h-10" />
              <div className={`inline-flex rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${mode.badgeClass}`}>
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

          <main className="flex items-start justify-center p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
            <div className="w-full max-w-md rounded-[1.45rem] border border-[rgba(15,76,129,0.08)] bg-white/88 p-4 shadow-[0_18px_40px_rgba(22,50,79,0.08)] backdrop-blur-sm sm:max-w-xl sm:p-6 lg:max-w-md lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
              <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
                <BrandLogo textColor="dark" className="h-9" />
                <div className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${mode.badgeClass}`}>
                  {mode.label} Access
                </div>
              </div>

              <div className="mb-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => navigateToSafeBack(router, currentRoute, "/")}
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(15,76,129,0.16)] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)] shadow-[0_10px_24px_rgba(4,12,26,0.08)] transition hover:border-[color:var(--brand-primary-soft)] hover:text-[color:var(--text-dark)]"
                >
                  <ArrowLeft className="size-3.5" />
                  Back
                </button>

                <div className="flex justify-center lg:justify-start">
                  <div className="inline-flex w-full max-w-sm rounded-full border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.04)] p-1">
                    <button
                      type="button"
                      onClick={() => setAccountType("student")}
                      className={`inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-3 py-2.5 text-sm font-semibold transition sm:px-5 ${
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
                      className={`inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-3 py-2.5 text-sm font-semibold transition sm:px-5 ${
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
              </div>

              <div className="mb-7 text-center">
                <div>
                  <h1 className="text-2xl font-bold text-[color:var(--text-dark)] sm:text-3xl">
                    {mode.title}
                  </h1>

                  <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                    {mode.subtitle}
                  </p>
                </div>
              </div>

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
              <div className="mt-5">
                <div className="relative mb-3 sm:mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[rgba(15,76,129,0.12)]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 tracking-[0.18em] text-[color:var(--text-muted)]">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="px-1 py-1 sm:px-2">
                  {googleClientId ? (
                    <div
                      ref={googleButtonShellRef}
                      className={`google-cta-frame relative mx-auto w-full max-w-[280px] ${
                        isGoogleLoading ? "opacity-80" : ""
                      }`}
                    >
                      <div className="google-cta-shell pointer-events-none flex min-h-12 items-center justify-center gap-3 rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-left shadow-[0_12px_24px_rgba(22,50,79,0.08)]">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[rgba(15,76,129,0.06)]">
                          <GoogleMark className="size-4.5" />
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-semibold text-[color:var(--text-dark)]">
                          {isGoogleLoading ? "Checking Google account..." : "Continue with Google"}
                        </span>
                      </div>
                      <div
                        ref={googleButtonRef}
                        className={`google-signin-hitbox absolute inset-0 ${
                          isGoogleLoading ? "pointer-events-none" : ""
                        }`}
                        aria-label="Continue with Google"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="flex w-full items-center justify-center rounded-[1.1rem] px-5 py-3 text-sm font-semibold text-gray-400"
                    >
                      Google login not configured
                    </button>
                  )}
                </div>

                <p className="mt-3 px-2 text-center text-[11px] leading-5 text-[color:var(--text-muted)] sm:text-xs">
                  OTP will be sent to the same Google email after sign-in.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
      {googleClientId ? (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => setIsGoogleScriptReady(true)}
        />
      ) : null}
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
