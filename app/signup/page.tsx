"use client";

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { readCurrentUser } from "@/lib/auth-storage";
import { request } from "@/lib/api";
import { useStatusToast } from "@/lib/toast";

type AccountType = "student" | "college";

type SignupStatus = {
  type: "error" | "success";
  text: string;
} | null;

const accountModes: Record<
  AccountType,
  {
    label: string;
    title: string;
    subtitle: string;
    accentClass: string;
    badgeClass: string;
  }
> = {
  student: {
    label: "Student",
    title: "Create Student Account",
    subtitle: "Set up your profile to explore colleges and compare courses.",
    accentClass: "from-[#1f63ff] to-[#377df3]",
    badgeClass:
      "border-[rgba(31,99,255,0.14)] bg-[rgba(31,99,255,0.08)] text-[#1f63ff]",
  },
  college: {
    label: "College",
    title: "Create College Account",
    subtitle: "Register your institution and connect with interested students.",
    accentClass: "from-[#0f7c74] to-[#1ca192]",
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
        icon: GraduationCap,
        title: "Explore Colleges",
        description: "Find and compare top colleges across India.",
      },
      {
        icon: BookOpen,
        title: "Find the Right Course",
        description: "Discover courses that match your interests and goals.",
      },
      {
        icon: BarChart3,
        title: "Make Informed Decisions",
        description: "Access detailed insights, reviews, and rankings.",
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

const normalizeIndianPhoneInput = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) return digits.slice(2, 12);
  return digits.slice(0, 10);
};

const isValidIndianPhone = (value: string) => /^[6-9]\d{9}$/.test(value);

function FeatureRow({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof GraduationCap;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 py-1 sm:gap-5">
      <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-[1rem] border border-[rgba(31,99,255,0.08)] bg-[rgba(31,99,255,0.05)] text-[#1f63ff] shadow-[0_8px_18px_rgba(4,12,26,0.04)]">
        <Icon className="size-7" />
      </span>
      <div className="min-w-0 max-w-[28rem]">
        <h3 className="text-[1.02rem] font-semibold leading-6 text-[color:var(--text-dark)]">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-[color:var(--text-muted)]">{description}</p>
      </div>
    </div>
  );
}

function CollegeFeatureCard({
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
    <div className="absolute right-6 top-10 z-20 w-[min(100%,17rem)] rounded-[1.65rem] border border-white/70 bg-white/92 p-5 shadow-[0_24px_58px_rgba(22,50,79,0.16)] backdrop-blur-xl sm:right-7 sm:top-12 sm:w-[17.25rem] sm:p-5">
      <div className="space-y-4">
        {features.map((feature) => (
          <div key={feature.title} className="flex items-start gap-3">
            <span
              className={`inline-flex size-11 shrink-0 items-center justify-center rounded-[0.95rem] ${feature.cardClassName || "bg-[rgba(31,99,255,0.08)] text-[#1f63ff]"}`}
            >
              <feature.icon className="size-5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold leading-5 text-[color:var(--text-dark)]">{feature.title}</h3>
              <p className="mt-1 text-[0.83rem] leading-5 text-[color:var(--text-muted)]">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawType = searchParams.get("type");
  const queryType: AccountType = rawType === "college" ? "college" : "student";
  const [accountType, setAccountType] = useState<AccountType>(queryType);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<SignupStatus>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
  }>({});

  useStatusToast(status);

  const mode = accountModes[accountType];
  const leftPanel = leftPanelContent[accountType];
  const loginHref = useMemo(() => `/login?type=${accountType}`, [accountType]);

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

  useEffect(() => {
    if (queryType !== accountType) {
      setAccountType(queryType);
    }
  }, [accountType, queryType]);

  const passwordStrength = useMemo(() => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  }, [password]);

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

  const validateForm = () => {
    const nextErrors: {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
    } = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const normalizedPhone = normalizeIndianPhoneInput(phone);

    if (!trimmedName) {
      nextErrors.name = "Please enter your full name.";
    }
    if (!trimmedEmail) {
      nextErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!normalizedPhone) {
      nextErrors.phone = "Please enter your mobile number.";
    } else if (!isValidIndianPhone(normalizedPhone)) {
      nextErrors.phone = "Enter a valid 10 digit mobile number.";
    }
    if (!password.trim()) {
      nextErrors.password = "Please create a password.";
    } else if (password.length < 8) {
      nextErrors.password = "Password should be at least 8 characters long.";
    }

    setFieldErrors(nextErrors);
    return {
      isValid: Object.keys(nextErrors).length === 0,
      trimmedName,
      trimmedEmail,
      normalizedPhone,
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { isValid, trimmedName, trimmedEmail, normalizedPhone } = validateForm();
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
      const data = await request<{ message?: string }>("/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password,
          phone: normalizedPhone,
          accountType,
        }),
      });

      setStatus({
        type: "success",
        text: data.message || "Signup successful.",
      });

      window.setTimeout(() => {
        router.push(loginHref);
      }, 1000);
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Signup failed.",
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

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1550px] flex-col px-0 py-0 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
        <div className="flex min-h-screen flex-col overflow-hidden rounded-none border-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,252,255,0.95))] shadow-none backdrop-blur-none sm:min-h-[calc(100vh-2rem)] sm:rounded-[1.95rem] sm:border sm:border-[rgba(15,76,129,0.08)] sm:shadow-[0_26px_70px_rgba(4,12,26,0.12)] sm:backdrop-blur-sm">
          <header className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
            <BrandLogo textColor="dark" className="h-10 sm:h-11" />

            <div className="hidden items-center gap-2 sm:flex sm:gap-4">
              <div className="hidden items-center gap-1 text-sm font-medium text-[color:var(--text-muted)] sm:flex">
                <span>Already have an account?</span>
                <Link href={loginHref} className="font-semibold text-[#1f63ff] transition hover:text-[#1552d6]">
                  Login
                </Link>
              </div>
            </div>
          </header>

          <div className="grid flex-1 gap-0 px-4 pb-4 pt-2 sm:px-6 sm:pb-6 sm:pt-6 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] lg:gap-5 lg:px-8 lg:pb-8 lg:pt-0">
            <aside className="relative hidden overflow-hidden px-1 py-6 lg:flex lg:min-h-0 lg:flex-col lg:px-2 lg:py-9">
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

                <div className="mt-6 max-w-3xl">
                  <h1 className="text-[clamp(2.1rem,4.8vw,4.15rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-[color:var(--text-dark)]">
                    {leftPanel.heading[0]}
                    <br />
                    {leftPanel.heading[1]}
                  </h1>
                  <p className={`mt-5 max-w-2xl text-base leading-8 text-[color:var(--text-muted)] sm:text-lg ${accountType === "college" ? "max-w-[32rem]" : ""}`}>
                    {leftPanel.description}
                  </p>
                </div>

                {accountType === "college" ? (
                  <div className="mt-10 flex-1 lg:mt-12">
                    <div className="relative min-h-[30rem] overflow-visible lg:min-h-[36rem]">
                      <div className="absolute inset-0 overflow-hidden">
                        <Image
                          src={leftPanel.imageSrc}
                          alt={leftPanel.imageAlt}
                          fill
                          priority
                          sizes={leftPanel.imageSizes}
                          className="object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_36%,rgba(8,18,38,0.16)_100%)]" />
                      </div>
                      <CollegeFeatureCard features={leftPanel.features} />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mt-8 grid gap-5 sm:mt-9">
                      {leftPanel.features.map((item) => (
                        <FeatureRow
                          key={item.title}
                          icon={item.icon}
                          title={item.title}
                          description={item.description}
                        />
                      ))}
                    </div>

                    <div className="mt-7 flex-1 lg:mt-8">
                      <div className="relative h-[16.5rem] overflow-hidden sm:h-[20rem] lg:h-full lg:min-h-[24rem]">
                        <Image
                          src={leftPanel.imageSrc}
                          alt={leftPanel.imageAlt}
                          fill
                          priority
                          sizes={leftPanel.imageSizes}
                          className="object-cover object-bottom"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0)_42%,rgba(8,18,38,0.18)_100%)]" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </aside>

            <main className="flex items-start justify-center">
              <div className="w-full rounded-none border-0 bg-transparent px-0 py-0 shadow-none backdrop-blur-none sm:rounded-[1.8rem] sm:border sm:border-[rgba(15,76,129,0.08)] sm:bg-white/92 sm:px-7 sm:py-7 sm:shadow-[0_18px_44px_rgba(4,12,26,0.08)] sm:backdrop-blur-sm lg:min-h-full lg:px-8 lg:py-8">
                <div className="text-center">
                  <h2 className="text-[clamp(1.9rem,3vw,2.5rem)] font-extrabold tracking-[-0.04em] text-[color:var(--text-dark)]">
                    Create Account
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)] sm:text-base">
                    Register and start your journey with College EdwiseR
                  </p>
                </div>

                <div className="relative mt-7 border-b border-[rgba(15,76,129,0.14)] pb-5">
                  <div
                    className={`absolute bottom-0 h-[3px] w-1/2 rounded-full bg-[#1f63ff] transition-transform duration-300 ${
                      accountType === "college" ? "translate-x-full" : "translate-x-0"
                    }`}
                  />

                  <div className="grid grid-cols-2 gap-0">
                    <button
                      type="button"
                      onClick={() => setAccountType("student")}
                      className={`inline-flex items-center justify-center gap-2 py-4 text-base font-semibold transition ${
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
                      className={`inline-flex items-center justify-center gap-2 py-4 text-base font-semibold transition ${
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
                        : "border-rose-200 bg-rose-50 text-rose-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        className={`mt-0.5 size-4 shrink-0 ${
                          status.type === "success" ? "text-emerald-600" : "text-rose-500"
                        }`}
                      />
                      <p className="min-w-0">{status.text}</p>
                    </div>
                  </div>
                ) : null}

                <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                  <div>
                    <label htmlFor="signup-name" className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
                      <input
                        id="signup-name"
                        type="text"
                        value={name}
                        onChange={(event) => {
                          setName(event.target.value);
                          if (fieldErrors.name) {
                            setFieldErrors((current) => ({ ...current, name: undefined }));
                          }
                        }}
                        autoComplete="name"
                        aria-invalid={Boolean(fieldErrors.name)}
                        aria-describedby={fieldErrors.name ? "signup-name-error" : undefined}
                        className={`w-full rounded-[1.05rem] border bg-white py-3.5 pl-11 pr-4 text-sm text-[color:var(--text-dark)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:shadow-[0_0_0_4px_rgba(31,99,255,0.1)] ${
                          fieldErrors.name
                            ? "border-rose-300 focus:border-rose-400"
                            : "border-[rgba(15,76,129,0.12)] focus:border-[#1f63ff]"
                        }`}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    {fieldErrors.name ? (
                      <p id="signup-name-error" className="mt-2 text-xs font-medium text-rose-600">
                        {fieldErrors.name}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="signup-email" className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
                      <input
                        id="signup-email"
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
                        aria-describedby={fieldErrors.email ? "signup-email-error" : undefined}
                        className={`w-full rounded-[1.05rem] border bg-white py-3.5 pl-11 pr-4 text-sm text-[color:var(--text-dark)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:shadow-[0_0_0_4px_rgba(31,99,255,0.1)] ${
                          fieldErrors.email
                            ? "border-rose-300 focus:border-rose-400"
                            : "border-[rgba(15,76,129,0.12)] focus:border-[#1f63ff]"
                        }`}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                    {fieldErrors.email ? (
                      <p id="signup-email-error" className="mt-2 text-xs font-medium text-rose-600">
                        {fieldErrors.email}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="signup-phone" className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
                      <input
                        id="signup-phone"
                        type="tel"
                        value={phone}
                        onChange={(event) => {
                          setPhone(normalizeIndianPhoneInput(event.target.value));
                          if (fieldErrors.phone) {
                            setFieldErrors((current) => ({ ...current, phone: undefined }));
                          }
                        }}
                        autoComplete="tel"
                        inputMode="numeric"
                        aria-invalid={Boolean(fieldErrors.phone)}
                        aria-describedby={fieldErrors.phone ? "signup-phone-error" : undefined}
                        className={`w-full rounded-[1.05rem] border bg-white py-3.5 pl-11 pr-4 text-sm text-[color:var(--text-dark)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:shadow-[0_0_0_4px_rgba(31,99,255,0.1)] ${
                          fieldErrors.phone
                            ? "border-rose-300 focus:border-rose-400"
                            : "border-[rgba(15,76,129,0.12)] focus:border-[#1f63ff]"
                        }`}
                        placeholder="10 digit mobile number"
                        required
                      />
                    </div>
                    {fieldErrors.phone ? (
                      <p id="signup-phone-error" className="mt-2 text-xs font-medium text-rose-600">
                        {fieldErrors.phone}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="signup-password" className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
                      <input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value);
                          if (fieldErrors.password) {
                            setFieldErrors((current) => ({ ...current, password: undefined }));
                          }
                        }}
                        autoComplete="new-password"
                        aria-invalid={Boolean(fieldErrors.password)}
                        aria-describedby={fieldErrors.password ? "signup-password-error" : undefined}
                        className={`w-full rounded-[1.05rem] border bg-white py-3.5 pl-11 pr-12 text-sm text-[color:var(--text-dark)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:shadow-[0_0_0_4px_rgba(31,99,255,0.1)] ${
                          fieldErrors.password
                            ? "border-rose-300 focus:border-rose-400"
                            : "border-[rgba(15,76,129,0.12)] focus:border-[#1f63ff]"
                        }`}
                        placeholder="Create a secure password"
                        required
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
                      <p id="signup-password-error" className="mt-2 text-xs font-medium text-rose-600">
                        {fieldErrors.password}
                      </p>
                    ) : null}

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

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`shine-button flex w-full items-center justify-center gap-3 rounded-[1.05rem] bg-gradient-to-r ${mode.accentClass} px-5 py-4 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(31,99,255,0.22)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70`}
                >
                    {isLoading ? "Creating account..." : "Create Account"}
                    {isLoading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-[18px]" />}
                  </button>
                </form>

                <p className="mt-7 text-center text-sm text-[color:var(--text-muted)]">
                  Already have an account?{" "}
                  <Link href={loginHref} className="font-semibold text-[#1f63ff] transition hover:text-[#1552d6]">
                    Login
                  </Link>
                </p>

                <p className="mt-5 flex items-center justify-center gap-2 text-sm text-[color:var(--text-muted)]">
                  <ShieldCheck className="size-4 text-emerald-500" />
                  Your data is safe and secure with us.
                </p>
              </div>
            </main>
          </div>

          <footer className="hidden border-t border-[rgba(15,76,129,0.08)] bg-white/72 px-4 py-4 text-sm text-[color:var(--text-muted)] sm:px-6 lg:block lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p>&copy; {new Date().getFullYear()} College EdwiseR. All rights reserved.</p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-medium">
                <Link href="/privacy-policy" className="transition hover:text-[#1f63ff]">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="transition hover:text-[#1f63ff]">
                  Terms of Service
                </Link>
                <Link href="/contact" className="transition hover:text-[#1f63ff]">
                  Help & Support
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageContent />
    </Suspense>
  );
}
