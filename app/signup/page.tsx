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
  Phone,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { PageBackButton } from "@/components/global-back-button";
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
    <div className="absolute right-3 top-3 z-20 w-[min(100%,15.5rem)] rounded-[1.1rem] border border-white/70 bg-white/92 p-2.5 shadow-[0_18px_40px_rgba(22,50,79,0.14)] backdrop-blur-xl sm:right-4 sm:top-4 sm:w-[16rem] sm:p-3">
      <div className="space-y-2.5">
        {features.map((feature) => (
          <div key={feature.title} className="flex items-start gap-2.5">
            <span
              className={`mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-[0.8rem] ${feature.cardClassName || "bg-[rgba(31,99,255,0.08)] text-[#1f63ff]"}`}
            >
              <feature.icon className="size-[15px]" />
            </span>
            <div className="min-w-0">
              <h3 className="text-[0.74rem] font-semibold leading-[1.05rem] text-[color:var(--text-dark)]">{feature.title}</h3>
              <p className="mt-0.5 text-[0.68rem] leading-4 text-[color:var(--text-muted)]">{feature.description}</p>
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
  }, [queryType, setAccountType]);

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
    <section className="relative min-h-[100dvh] overflow-hidden bg-[linear-gradient(180deg,#f7fbff_0%,#edf5fb_100%)] text-[color:var(--text-dark)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(31,99,255,0.14),transparent_22%),radial-gradient(circle_at_84%_12%,rgba(255,193,92,0.15),transparent_18%),radial-gradient(circle_at_74%_76%,rgba(15,124,116,0.12),transparent_22%)]" />
      <div className="mesh-bg opacity-60" />
      <div className="hero-grid absolute inset-0 opacity-[0.08]" />

      <div className="relative z-10 flex min-h-[100dvh] w-full flex-col px-0 py-0">
        <div className="flex min-h-[100dvh] flex-col overflow-hidden rounded-none border-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,252,255,0.95))] shadow-none backdrop-blur-none">
          <header className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5 sm:py-4 lg:px-8 xl:px-10">
            <div className="flex items-center gap-3 sm:gap-4">
              <BrandLogo textColor="dark" className="h-11 sm:h-12 lg:h-11" />
              <div className="hidden lg:block">
                <PageBackButton variant="inline" className="ml-0" />
              </div>
            </div>

            <div className="hidden items-center gap-2 sm:flex sm:gap-4 lg:pr-1 xl:pr-2">
              <div className="hidden items-center gap-1 text-sm font-medium text-[color:var(--text-muted)] sm:flex">
                <span>Already have an account?</span>
                <Link href={loginHref} className="font-semibold text-[#1f63ff] transition hover:text-[#1552d6]">
                  Login
                </Link>
              </div>
            </div>
          </header>

          <div className="flex flex-1 min-h-0 flex-col gap-0 px-4 py-1 sm:px-5 sm:py-3 lg:grid lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)] lg:items-stretch lg:gap-3 lg:px-8 lg:pb-2 lg:pt-0 xl:px-10">
            <aside className="relative hidden h-full overflow-hidden px-1 py-3 lg:flex lg:min-h-0 lg:flex-col lg:px-5 lg:py-3.5 xl:px-6">
              <div className="absolute left-[-5rem] top-0 h-44 w-44 rounded-full bg-[rgba(31,99,255,0.12)] blur-3xl" />
              <div className="absolute right-[-4rem] bottom-8 h-40 w-40 rounded-full bg-[rgba(255,177,60,0.12)] blur-3xl" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0))]" />

              <div className="relative z-10 flex h-full flex-col">
                <div className="mt-2 max-w-3xl lg:max-w-[33rem] xl:max-w-[36rem] 2xl:max-w-[40rem]">
                  <h1
                    className={`text-[clamp(1.55rem,3vw,3.05rem)] font-semibold tracking-[-0.035em] text-[color:var(--text-dark)] lg:text-[clamp(1.9rem,2.8vw,3.4rem)] xl:text-[clamp(2.05rem,2.4vw,3.8rem)] 2xl:text-[clamp(2.25rem,2vw,4.25rem)] ${
                      accountType === "college"
                        ? "text-[clamp(1.42rem,2.7vw,2.8rem)] leading-[1.22] lg:text-[clamp(1.75rem,2.5vw,3.15rem)] xl:text-[clamp(1.95rem,2.2vw,3.45rem)] 2xl:text-[clamp(2.1rem,1.8vw,3.95rem)] xl:leading-[1.16] 2xl:leading-[1.12]"
                        : "leading-[1.2] lg:leading-[1.18] xl:leading-[1.14] 2xl:leading-[1.1]"
                    }`}
                  >
                    <span className="block">{leftPanel.heading[0]}</span>
                    {accountType === "college" ? (
                      <span className="mt-1.5 block">
                        <span>Innovating </span>
                        <span className="text-[#1f63ff]">Education.</span>
                      </span>
                    ) : (
                      <span className="mt-1.5 block">
                        <span>Connecting </span>
                        <span className="text-[#1f63ff]">Opportunities.</span>
                      </span>
                    )}
                  </h1>
                </div>

                <div className="mt-2 flex-1 lg:mt-2.5">
                  <div className="relative min-h-[21rem] overflow-visible lg:min-h-[27rem] xl:min-h-[31rem] 2xl:min-h-[35rem]">
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

            <main className="flex flex-1 items-start justify-center py-3 lg:items-center lg:py-2.5">
              <div className="mx-auto w-full max-w-[24rem] rounded-none border-0 bg-transparent px-0 py-0 shadow-none backdrop-blur-none sm:max-w-[25rem] lg:max-w-[390px] xl:max-w-[430px] 2xl:max-w-[470px]">
                <div className="relative mb-4 overflow-hidden rounded-[1.9rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(243,249,255,0.94))] px-5 py-5 shadow-[0_18px_40px_rgba(22,50,79,0.08)] sm:hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(31,99,255,0.16),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(255,177,60,0.12),transparent_34%)]" />
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-[clamp(1.85rem,7vw,2.25rem)] font-semibold tracking-[-0.04em] text-[color:var(--text-dark)]">
                        Create Account
                      </h2>
                      <p className="mt-2 max-w-[15rem] text-[0.96rem] leading-6 text-[color:var(--text-muted)]">
                        {mode.subtitle}
                      </p>
                    </div>
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[1.25rem]">
                      <Image
                        src={leftPanel.imageSrc}
                        alt={leftPanel.imageAlt}
                        fill
                        priority
                        sizes="80px"
                        className="object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_45%,rgba(8,18,38,0.12)_100%)]" />
                    </div>
                  </div>
                </div>

                <div className="hidden text-center sm:block">
                  <h2 className="text-[clamp(1.7rem,6vw,2.15rem)] font-semibold tracking-[-0.02em] text-[color:var(--text-dark)] sm:text-[clamp(1.6rem,2.1vw,2.05rem)] lg:text-[clamp(2rem,1.75vw,2.35rem)] xl:text-[clamp(2.15rem,1.55vw,2.5rem)] 2xl:text-[clamp(2.3rem,1.35vw,2.7rem)]">
                    Create Account
                  </h2>
                </div>

                <div className="relative mt-3 border-b border-[rgba(15,76,129,0.14)] pb-1.5">
                  <div
                    className={`absolute bottom-0 h-[3px] w-1/2 rounded-full bg-[#1f63ff] transition-transform duration-300 ${
                      accountType === "college" ? "translate-x-full" : "translate-x-0"
                    }`}
                  />

                  <div className="grid grid-cols-2 gap-0">
                    <button
                      type="button"
                      onClick={() => setAccountType("student")}
                      className={`inline-flex items-center justify-center gap-2 py-2.5 text-[0.95rem] font-semibold transition sm:py-2 sm:text-base lg:py-3 lg:text-[1rem] xl:py-[0.85rem] xl:text-[1.02rem] 2xl:py-[0.95rem] 2xl:text-[1.05rem] ${
                        accountType === "student"
                          ? "text-[#1f63ff]"
                          : "text-[color:var(--text-muted)] hover:text-[color:var(--text-dark)]"
                      }`}
                    >
                      <GraduationCap className="size-5" />
                      Student
                    </button>

                    <button
                      type="button"
                      onClick={() => setAccountType("college")}
                      className={`inline-flex items-center justify-center gap-2 py-2.5 text-[0.95rem] font-semibold transition sm:py-2 sm:text-base lg:py-3 lg:text-[1rem] xl:py-[0.85rem] xl:text-[1.02rem] 2xl:py-[0.95rem] 2xl:text-[1.05rem] ${
                        accountType === "college"
                          ? "text-[#1f63ff]"
                          : "text-[color:var(--text-muted)] hover:text-[color:var(--text-dark)]"
                      }`}
                    >
                      <Building2 className="size-5" />
                      College
                    </button>
                  </div>
                </div>

                {status ? (
                  <div
                    role="alert"
                    aria-live="polite"
                    className={`mt-4 rounded-[1.2rem] border px-4 py-2.5 text-[0.95rem] leading-6 lg:px-5 lg:py-3 lg:text-[1rem] xl:rounded-[1.25rem] xl:px-5 xl:py-3.5 xl:text-[1.02rem] 2xl:px-6 2xl:py-4 2xl:text-[1.05rem] ${
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

                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                  <div>
                    <label htmlFor="signup-name" className="mb-1.5 block text-[0.95rem] font-semibold text-[color:var(--text-dark)] sm:text-sm lg:text-[1rem] xl:text-[1.02rem] 2xl:text-[1.05rem]">
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
                        className={`w-full rounded-[1.05rem] border bg-white py-3 pl-11 pr-4 text-[0.95rem] text-[color:var(--text-dark)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:shadow-[0_0_0_4px_rgba(31,99,255,0.1)] sm:py-2.5 sm:text-sm lg:py-3 lg:text-[1rem] xl:py-3.5 xl:text-[1.02rem] 2xl:py-[0.95rem] 2xl:text-[1.05rem] ${
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
                    <label htmlFor="signup-email" className="mb-1.5 block text-[0.95rem] font-semibold text-[color:var(--text-dark)] sm:text-sm lg:text-[1rem] xl:text-[1.02rem] 2xl:text-[1.05rem]">
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
                        className={`w-full rounded-[1.05rem] border bg-white py-3 pl-11 pr-4 text-[0.95rem] text-[color:var(--text-dark)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:shadow-[0_0_0_4px_rgba(31,99,255,0.1)] sm:py-2.5 sm:text-sm lg:py-3 lg:text-[1rem] xl:py-3.5 xl:text-[1.02rem] 2xl:py-[0.95rem] 2xl:text-[1.05rem] ${
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
                    <label htmlFor="signup-phone" className="mb-1.5 block text-[0.95rem] font-semibold text-[color:var(--text-dark)] sm:text-sm lg:text-[1rem] xl:text-[1.02rem] 2xl:text-[1.05rem]">
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
                        className={`w-full rounded-[1.05rem] border bg-white py-3 pl-11 pr-4 text-[0.95rem] text-[color:var(--text-dark)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:shadow-[0_0_0_4px_rgba(31,99,255,0.1)] sm:py-2.5 sm:text-sm lg:py-3 lg:text-[1rem] xl:py-3.5 xl:text-[1.02rem] 2xl:py-[0.95rem] 2xl:text-[1.05rem] ${
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
                    <label htmlFor="signup-password" className="mb-1.5 block text-[0.95rem] font-semibold text-[color:var(--text-dark)] sm:text-sm lg:text-[1rem] xl:text-[1.02rem] 2xl:text-[1.05rem]">
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
                        className={`w-full rounded-[1.05rem] border bg-white py-3 pl-11 pr-12 text-[0.95rem] text-[color:var(--text-dark)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:shadow-[0_0_0_4px_rgba(31,99,255,0.1)] sm:py-2.5 sm:text-sm lg:py-3 lg:text-[1rem] xl:py-3.5 xl:text-[1.02rem] 2xl:py-[0.95rem] 2xl:text-[1.05rem] ${
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

                  </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`shine-button flex w-full items-center justify-center gap-3 rounded-[1.05rem] bg-gradient-to-r ${mode.accentClass} px-5 py-3 text-[0.95rem] font-semibold text-white shadow-[0_16px_30px_rgba(31,99,255,0.22)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 sm:py-[0.625rem] sm:text-sm lg:py-3 lg:text-[1rem] xl:py-3.5 xl:text-[1.02rem] 2xl:py-[0.95rem] 2xl:text-[1.05rem]`}
                >
                    {isLoading ? "Creating account..." : "Create Account"}
                    {isLoading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-[18px]" />}
                  </button>

                  <div className="sm:hidden">
                      <div className="flex items-center justify-center gap-1.5 text-[0.78rem] text-[color:var(--text-muted)] lg:text-[0.8rem] xl:text-[0.82rem] 2xl:text-[0.84rem]">
                      <span>Already have an account?</span>
                      <Link href={loginHref} className="font-semibold text-[#1f63ff] transition hover:text-[#1552d6]">
                        Login
                      </Link>
                    </div>
                  </div>
                </form>

              </div>
            </main>
          </div>
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
