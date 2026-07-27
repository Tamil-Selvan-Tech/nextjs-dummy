"use client";

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { persistAuth, persistPendingOtpLogin, readCurrentUser, type SafeAuthUser } from "@/lib/auth-storage";
import { request } from "@/lib/api";
import { useStatusToast } from "@/lib/toast";

type AccountType = "student" | "college";

type LoginStatus = {
  type: "error" | "success" | "info";
  text: string;
} | null;

type LoginResponse = {
  message?: string;
  requiresOtp?: boolean;
  email?: string;
  role?: string;
  devOtp?: string;
  token?: string;
  user?: SafeAuthUser;
};

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

const accountModes: Record<
  AccountType,
  {
    label: string;
    title: string;
    subtitle: string;
    accentClass: string;
    tabClass: string;
    badgeClass: string;
  }
> = {
  student: {
    label: "Student",
    title: "Student Login",
    subtitle: "Explore colleges, compare courses, and submit enquiries.",
    accentClass: "from-[#1f63ff] to-[#377df3]",
    tabClass: "bg-[linear-gradient(180deg,#1f63ff,#1552d6)] text-white shadow-[0_12px_28px_rgba(31,99,255,0.24)]",
    badgeClass:
      "border-[rgba(31,99,255,0.14)] bg-[rgba(31,99,255,0.08)] text-[#1f63ff]",
  },
  college: {
    label: "College",
    title: "College Login",
    subtitle: "Access college profiles, leads, and enquiry updates.",
    accentClass: "from-[#0f7c74] to-[#1ca192]",
    tabClass: "bg-[linear-gradient(180deg,#0f7c74,#0b6b64)] text-white shadow-[0_12px_28px_rgba(15,124,116,0.24)]",
    badgeClass:
      "border-[rgba(15,124,116,0.14)] bg-[rgba(15,124,116,0.08)] text-[#0f7c74]",
  },
};

const leftPanelContent: Record<
  AccountType,
  {
    eyebrow: string;
    heading: [string, string];
    description: string;
    imageSrc: string;
    imageAlt: string;
    imageSizes: string;
    features: Array<{
      icon: typeof GraduationCap;
      title: string;
      description: string;
      cardClassName?: string;
    }>;
  }
> = {
  student: {
    eyebrow: "Your Future, Our Guidance",
    heading: ["Empowering Students.", "Connecting Opportunities."],
    description:
      "Discover the best colleges, compare courses, read reviews, and make informed decisions for a brighter future.",
    imageSrc: "/student-login-image.png",
    imageAlt: "Students studying on campus",
    imageSizes: "(min-width: 1024px) 55vw, 100vw",
    features: [
      {
        icon: BookOpen,
        title: "Find the Right Course",
        description: "Discover courses that match your interests and goals.",
      },
      {
        icon: BarChart3,
        title: "Explore Colleges",
        description: "Find and compare top colleges across India.",
      },
    ],
  },
  college: {
    eyebrow: "Your Institution, Our Network",
    heading: ["Empowering Colleges.", "Innovating Education."],
    description:
      "Streamline student enquiries, manage college profiles, and connect with future students.",
    imageSrc: "/college-login-image.png",
    imageAlt: "College campus with students walking through the grounds",
    imageSizes: "(min-width: 1024px) 55vw, 100vw",
    features: [
      {
        icon: ShieldCheck,
        title: "Secure Access",
        description: "Your data is protected with enterprise-grade security.",
        cardClassName: "bg-[rgba(99,91,255,0.10)] text-[#5b5cff]",
      },
      {
        icon: BarChart3,
        title: "Manage Efficiently",
        description: "Update college details, courses, and facilities effortlessly.",
        cardClassName: "bg-[rgba(31,99,255,0.10)] text-[#1f63ff]",
      },
      {
        icon: Users,
        title: "Connect & Grow",
        description: "Engage with students and build your college's future.",
        cardClassName: "bg-[rgba(22,163,74,0.10)] text-[#16a34a]",
      },
    ],
  },
};

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

function GoogleMark({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.39a4.61 4.61 0 0 1-2 3.02v2.5h3.23c1.89-1.73 2.98-4.28 2.98-7.35Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.42l-3.23-2.5c-.9.6-2.05.95-3.38.95-2.6 0-4.8-1.75-5.59-4.1H3.08v2.58A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC04" d="M6.41 13.93A5.99 5.99 0 0 1 6.1 12c0-.67.12-1.31.31-1.93V7.5H3.08A10 10 0 0 0 2 12c0 1.61.39 3.14 1.08 4.5l3.33-2.57Z" />
      <path fill="#EA4335" d="M12 5.97c1.47 0 2.8.51 3.84 1.5l2.88-2.88C16.95 2.94 14.7 2 12 2A10 10 0 0 0 3.08 7.5l3.33 2.57C7.2 7.72 9.4 5.97 12 5.97Z" />
    </svg>
  );
}

function FeatureOverlayCard({
  features,
}: {
  features: Array<{
    icon: typeof GraduationCap;
    title: string;
    description: string;
    cardClassName?: string;
  }>;
}) {
  return (
    <div className="absolute right-4 top-4 z-20 w-[min(100%,19rem)] rounded-[1.45rem] border border-white/70 bg-white/92 p-3.5 shadow-[0_24px_58px_rgba(22,50,79,0.16)] backdrop-blur-xl sm:right-5 sm:top-5 sm:w-[19.5rem] sm:p-4">
      <div className="space-y-3">
        {features.map((feature) => (
          <div key={feature.title} className="flex items-start gap-3">
            <span
              className={`inline-flex size-9 shrink-0 items-center justify-center rounded-[0.85rem] ${feature.cardClassName || "bg-[rgba(31,99,255,0.08)] text-[#1f63ff]"}`}
            >
              <feature.icon className="size-4" />
            </span>
            <div className="min-w-0">
              <h3 className="text-[0.84rem] font-semibold leading-5 text-[color:var(--text-dark)]">{feature.title}</h3>
              <p className="mt-0.5 text-[0.76rem] leading-[1.35rem] text-[color:var(--text-muted)]">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawType = searchParams.get("type");
  const queryType: AccountType = rawType === "college" ? "college" : "student";
  const [accountType, setAccountType] = useState<AccountType>(queryType);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGoogleScriptReady, setIsGoogleScriptReady] = useState(false);
  const [googleButtonWidth, setGoogleButtonWidth] = useState(0);
  const [status, setStatus] = useState<LoginStatus>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const googleButtonShellRef = useRef<HTMLDivElement | null>(null);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const hasInitializedGoogleRef = useRef(false);

  useStatusToast(status);

  const mode = accountModes[accountType];
  const leftPanel = leftPanelContent[accountType];
  const signupHref = useMemo(() => `/signup?type=${accountType}`, [accountType]);
  const defaultRedirect = useMemo(
    () => (accountType === "college" ? "/college-dashboard" : "/account"),
    [accountType],
  );

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

  const redirectToOtpStep = (otpEmail: string, role: string, devOtp?: string) => {
    persistPendingOtpLogin({
      email: otpEmail,
      role,
      accountType,
      ...(devOtp ? { devOtp } : {}),
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
        const data = await request<LoginResponse>("/api/users/login/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential, accountType }),
        });

        if (data.requiresOtp && data.email && data.role) {
          redirectToOtpStep(data.email, data.role, data.devOtp);
          return;
        }

        setStatus({
          type: "error",
          text: data.message || "Google sign-in could not continue.",
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Google sign-in failed.";
        setStatus({
          type: "error",
          text: errorMessage,
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
    if (!googleClientId || !googleButtonShellRef.current) return;

    const shell = googleButtonShellRef.current;
    const syncGoogleButtonWidth = () => {
      const nextWidth = Math.round(Math.max(240, shell.offsetWidth || 0));
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
    if (!googleClientId || !isGoogleScriptReady || hasInitializedGoogleRef.current) {
      return;
    }

    const googleAccountsId = window.google?.accounts?.id;
    if (!googleAccountsId) return;

    googleAccountsId.initialize({
      client_id: googleClientId,
      callback: handleGoogleCredentialResponse,
    });

    hasInitializedGoogleRef.current = true;
  }, [handleGoogleCredentialResponse, isGoogleScriptReady]);

  useEffect(() => {
    if (!googleClientId || !isGoogleScriptReady || !googleButtonRef.current || !googleButtonWidth) {
      return;
    }

    const googleAccountsId = window.google?.accounts?.id;
    if (!googleAccountsId) return;

    googleButtonRef.current.innerHTML = "";
    googleAccountsId.renderButton(googleButtonRef.current, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      width: googleButtonWidth,
      logo_alignment: "left",
    });
  }, [googleButtonWidth, isGoogleScriptReady]);

  const validateForm = () => {
    const nextErrors: { email?: string; password?: string } = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!password.trim()) {
      nextErrors.password = "Please enter your password.";
    }

    setFieldErrors(nextErrors);
    return {
      isValid: Object.keys(nextErrors).length === 0,
      trimmedEmail,
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { isValid, trimmedEmail } = validateForm();
    if (!isValid) {
      setStatus({
        type: "error",
        text: "Please fix the highlighted fields and try again.",
      });
      return;
    }

    setStatus(null);
    setIsLoading(true);

    try {
      const data = await request<LoginResponse>("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
          accountType,
        }),
      });

      if (data?.requiresOtp) {
        if (data.email && data.role) {
          redirectToOtpStep(data.email, data.role, data.devOtp);
          return;
        }

        throw new Error("Login succeeded, but the OTP handoff was incomplete. Please try again.");
      }

      if (data?.token && data?.user) {
        const nextUser: SafeAuthUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          role: data.user.role,
        };

        persistAuth(data.token, nextUser);
        persistPendingOtpLogin(null);

        const nextRoute =
          nextUser.role === "admin"
            ? "/admin"
            : nextUser.role === "college"
              ? "/college-dashboard"
              : "/account";

        setStatus({
          type: "success",
          text: data.message || "Login successful.",
        });
        router.push(nextRoute);
        return;
      }

      throw new Error(data?.message || "Login response was incomplete. Please try again.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed.";
      const isNetworkFailure =
        /failed to fetch|networkerror|network request failed|fetch/i.test(errorMessage);
      const isOtpDeliveryFailure =
        /otp/i.test(errorMessage) && /sent|send|mail|email/i.test(errorMessage);

      setStatus({
        type: "error",
        text: isNetworkFailure
          ? "We could not reach the login service. Please check your connection and try again."
          : isOtpDeliveryFailure
            ? "Your password was accepted, but the OTP email could not be delivered. Please try again in a moment."
            : errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f7fbff_0%,#edf5fb_100%)] text-[color:var(--text-dark)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(31,99,255,0.14),transparent_22%),radial-gradient(circle_at_84%_12%,rgba(255,193,92,0.15),transparent_18%),radial-gradient(circle_at_74%_76%,rgba(15,124,116,0.12),transparent_22%)]" />
      <div className="mesh-bg opacity-60" />
      <div className="hero-grid absolute inset-0 opacity-[0.08]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1550px] flex-col px-0 py-0 sm:px-3 sm:py-3 lg:px-4 lg:py-4">
        <div className="flex min-h-screen flex-col overflow-hidden rounded-none border-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,252,255,0.95))] shadow-none backdrop-blur-none">
          <header className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5 sm:py-4 lg:px-6">
            <BrandLogo textColor="dark" className="h-10 sm:h-11" />

            <div className="hidden items-center gap-2 sm:flex sm:gap-4">
              <div className="hidden items-center gap-1 text-sm font-medium text-[color:var(--text-muted)] sm:flex">
                <span>New here?</span>
                <Link href={signupHref} className="font-semibold text-[#1f63ff] transition hover:text-[#1552d6]">
                  Create an account
                </Link>
              </div>
            </div>
          </header>

          <div className="grid flex-1 min-h-0 gap-0 px-4 pb-3 pt-1 sm:px-5 sm:pb-4 sm:pt-4 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)] lg:gap-4 lg:px-6 lg:pb-5 lg:pt-0">
            <aside className="relative hidden overflow-hidden px-1 py-4 lg:flex lg:min-h-0 lg:flex-col lg:px-2 lg:py-5">
              <div className="absolute left-[-5rem] top-0 h-44 w-44 rounded-full bg-[rgba(31,99,255,0.12)] blur-3xl" />
              <div className="absolute right-[-4rem] bottom-8 h-40 w-40 rounded-full bg-[rgba(255,177,60,0.12)] blur-3xl" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0))]" />

              <div className="relative z-10 flex h-full flex-col">
                {accountType === "student" ? (
                  <span
                    className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-semibold shadow-[0_10px_22px_rgba(31,99,255,0.08)] ${mode.badgeClass}`}
                  >
                    Your Future, Our Guidance
                  </span>
                ) : null}

                <div className="mt-4 max-w-3xl">
                  <h1 className="text-[clamp(1.75rem,3.4vw,3.5rem)] font-extrabold leading-[1.04] tracking-[-0.045em] text-[color:var(--text-dark)] xl:text-[clamp(1.9rem,3vw,3.7rem)]">
                    {leftPanel.heading[0]}
                    <br />
                    {leftPanel.heading[1]}
                  </h1>
                  <p className={`mt-4 max-w-2xl text-sm leading-7 text-[color:var(--text-muted)] sm:text-base ${accountType === "college" ? "max-w-[32rem]" : ""}`}>
                    {leftPanel.description}
                  </p>
                </div>

                <div className="mt-3 flex-1 lg:mt-4">
                  <div className="relative min-h-[28rem] overflow-visible lg:min-h-[34rem]">
                    <Image
                      src={leftPanel.imageSrc}
                      alt={leftPanel.imageAlt}
                      fill
                      priority
                      sizes={leftPanel.imageSizes}
                      className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_36%,rgba(8,18,38,0.16)_100%)]" />
                    <FeatureOverlayCard features={leftPanel.features} />
                  </div>
                </div>
              </div>
            </aside>

            <main className="flex items-start justify-center">
              <div className="mx-auto w-full rounded-none border-0 bg-transparent px-0 py-0 shadow-none backdrop-blur-none lg:max-w-[360px] xl:max-w-[390px]">
                <div className="text-center">
                  <h2 className="text-[clamp(1.65rem,2.2vw,2.1rem)] font-extrabold tracking-[-0.04em] text-[color:var(--text-dark)] sm:text-[clamp(1.75rem,2.4vw,2.25rem)]">
                    Welcome Back!
                  </h2>
                </div>

                <div className="relative mt-5 border-b border-[rgba(15,76,129,0.14)] pb-4">
                  <div
                    className={`absolute bottom-0 h-[3px] w-1/2 rounded-full bg-[#1f63ff] transition-transform duration-300 ${
                      accountType === "college" ? "translate-x-full" : "translate-x-0"
                    }`}
                  />

                  <div className="grid grid-cols-2 gap-0">
                    <button
                      type="button"
                      onClick={() => setAccountType("student")}
                      className={`inline-flex items-center justify-center gap-2 py-3 text-sm font-semibold transition sm:text-base ${
                        accountType === "student"
                          ? "text-[#1f63ff]"
                          : "text-[color:var(--text-muted)] hover:text-[color:var(--text-dark)]"
                      }`}
                    >
                      <GraduationCap className="size-[18px]" />
                      Student
                    </button>

                    <button
                      type="button"
                      onClick={() => setAccountType("college")}
                      className={`inline-flex items-center justify-center gap-2 py-3 text-sm font-semibold transition sm:text-base ${
                        accountType === "college"
                          ? "text-[#1f63ff]"
                          : "text-[color:var(--text-muted)] hover:text-[color:var(--text-dark)]"
                      }`}
                    >
                      <Building2 className="size-[18px]" />
                      College
                    </button>
                  </div>
                </div>

                {status ? (
                  <div
                    role="alert"
                    aria-live="polite"
                    className={`mt-6 rounded-[1.2rem] border px-4 py-3 text-sm leading-6 ${
                      status.type === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : status.type === "info"
                          ? "border-sky-200 bg-sky-50 text-sky-800"
                          : "border-rose-200 bg-rose-50 text-rose-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        className={`mt-0.5 size-4 shrink-0 ${
                          status.type === "success"
                            ? "text-emerald-600"
                            : status.type === "info"
                              ? "text-sky-600"
                              : "text-rose-500"
                        }`}
                      />
                      <p className="min-w-0">{status.text}</p>
                    </div>
                  </div>
                ) : null}

                <form onSubmit={handleSubmit} className="mt-5 space-y-4 ">
                  <div>
                    <label
                      htmlFor="login-email"
                      className="mb-1.5 block text-sm font-semibold text-[color:var(--text-dark)]"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
                      <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          if (fieldErrors.email) {
                            setFieldErrors((current) => ({ ...current, email: undefined }));
                          }
                        }}
                        autoComplete="email"
                        inputMode="email"
                        aria-invalid={Boolean(fieldErrors.email)}
                        aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
                        className={`w-full rounded-[1.05rem] border bg-white py-3 pl-11 pr-4 text-sm text-[color:var(--text-dark)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:shadow-[0_0_0_4px_rgba(31,99,255,0.1)] ${
                          fieldErrors.email
                            ? "border-rose-300 focus:border-rose-400"
                            : "border-[rgba(15,76,129,0.12)] focus:border-[#1f63ff]"
                        }`}
                        placeholder="Enter your email address"
                      />
                    </div>
                    {fieldErrors.email ? (
                      <p id="login-email-error" className="mt-2 text-xs font-medium text-rose-600">
                        {fieldErrors.email}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label
                      htmlFor="login-password"
                      className="mb-1.5 block text-sm font-semibold text-[color:var(--text-dark)]"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value);
                          if (fieldErrors.password) {
                            setFieldErrors((current) => ({ ...current, password: undefined }));
                          }
                        }}
                        autoComplete="current-password"
                        aria-invalid={Boolean(fieldErrors.password)}
                        aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
                        className={`w-full rounded-[1.05rem] border bg-white py-3 pl-11 pr-12 text-sm text-[color:var(--text-dark)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:shadow-[0_0_0_4px_rgba(31,99,255,0.1)] ${
                          fieldErrors.password
                            ? "border-rose-300 focus:border-rose-400"
                            : "border-[rgba(15,76,129,0.12)] focus:border-[#1f63ff]"
                        }`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[color:var(--text-muted)] transition hover:text-[#1f63ff]"
                      >
                        {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                      </button>
                    </div>
                    {fieldErrors.password ? (
                      <p id="login-password-error" className="mt-2 text-xs font-medium text-rose-600">
                        {fieldErrors.password}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-end">
                    <Link
                      href="/forgot-password"
                      className="font-semibold text-[#1f63ff] transition hover:text-[#1552d6]"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`shine-button flex w-full items-center justify-center gap-3 rounded-[1.05rem] bg-gradient-to-r ${mode.accentClass} px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(31,99,255,0.22)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70`}
                  >
                    {isLoading ? "Signing in..." : "Login"}
                    {isLoading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-[18px]" />}
                  </button>
                </form>

                <div className="mt-5">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-[rgba(15,76,129,0.12)]" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-4 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {googleClientId ? (
                      <div
                        ref={googleButtonShellRef}
                        className={`relative w-full ${isGoogleLoading ? "opacity-80" : ""}`}
                      >
                        <button
                          type="button"
                          disabled
                        className="flex w-full items-center justify-center gap-3 rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-5 py-3 text-sm font-semibold text-[color:var(--text-dark)] shadow-[0_12px_24px_rgba(22,50,79,0.08)] transition hover:border-[rgba(15,76,129,0.18)] hover:bg-[rgba(15,76,129,0.02)]"
                      >
                          <GoogleMark className="size-[18px]" />
                          {isGoogleLoading ? "Checking Google account..." : "Continue with Google"}
                        </button>
                        {isGoogleScriptReady && googleButtonWidth ? (
                          <div
                            ref={googleButtonRef}
                            className={`absolute inset-0 z-10 rounded-[1rem] opacity-0 ${isGoogleLoading ? "pointer-events-none" : ""}`}
                            aria-label="Continue with Google"
                          />
                        ) : null}
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="flex w-full items-center justify-center gap-3 rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-5 py-3 text-sm font-semibold text-[color:var(--text-dark)] shadow-[0_12px_24px_rgba(22,50,79,0.08)]"
                      >
                        <GoogleMark className="size-[18px]" />
                        Google login not configured
                      </button>
                    )}

                  </div>

                  <p className="mt-4 flex items-center justify-center gap-2 text-sm text-[color:var(--text-muted)]">
                    <ShieldCheck className="size-4 text-emerald-500" />
                    Your data is safe and secure with us.
                  </p>
                </div>

                <p className="mt-5 text-center text-sm text-[color:var(--text-muted)]">
                  Don&apos;t have an account?{" "}
                  <Link href={signupHref} className="font-semibold text-[#1f63ff] transition hover:text-[#1552d6]">
                    Create one
                  </Link>
                </p>
              </div>
            </main>
          </div>
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
