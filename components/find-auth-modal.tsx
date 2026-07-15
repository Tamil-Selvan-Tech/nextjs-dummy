"use client";

import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { persistAuth, persistPendingOtpLogin, type SafeAuthUser } from "@/lib/auth-storage";
import { request } from "@/lib/api";
import { useStatusToast } from "@/lib/toast";

type AuthTab = "login" | "register";

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleButtonConfiguration = {
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin" | "continue";
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

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const modalAccountType = "student";

const normalizeIndianPhoneInput = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) return digits.slice(2, 12);
  return digits.slice(0, 10);
};

const isValidIndianPhone = (value: string) => /^[6-9]\d{9}$/.test(value);

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

export type FindAuthModalProps = {
  isOpen: boolean;
  redirectPath: string;
  onClose: () => void;
  onAuthenticated: (user: SafeAuthUser) => void;
};

export function FindAuthModal({ isOpen, redirectPath, onClose, onAuthenticated }: FindAuthModalProps) {
  const [authMode, setAuthMode] = useState<AuthTab>("login");
  const [authFlipKey, setAuthFlipKey] = useState(0);
  const [authFlipDirection, setAuthFlipDirection] = useState<"left" | "right">("right");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGoogleScriptReady, setIsGoogleScriptReady] = useState(false);
  const [googleButtonWidth, setGoogleButtonWidth] = useState(0);
  const [status, setStatus] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const googleButtonShellRef = useRef<HTMLDivElement | null>(null);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  useStatusToast(status);

  const loginRedirectPath = useMemo(() => {
    const base = redirectPath.startsWith("/") ? redirectPath : "/";
    return base.includes("?") ? `${base}&continueStep=2` : `${base}?continueStep=2`;
  }, [redirectPath]);
  const isLoginMode = authMode === "login";
  const switchAuthMode = useCallback(
    (nextMode: AuthTab) => {
      setAuthFlipDirection(authMode === "login" && nextMode === "register" ? "right" : "left");
      setAuthMode(nextMode);
      setAuthFlipKey((current) => current + 1);
    },
    [authMode],
  );

  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;
    const previousOverflow = document.body.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyWidth = document.body.style.width;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.documentElement.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.width = previousBodyWidth;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.removeEventListener("keydown", onKeyDown);
      window.scrollTo(0, scrollY);
    };
  }, [isOpen, onClose]);

  const redirectToOtpStep = useMemo(
    () => (otpEmail: string, role: string, devOtp?: string) => {
      persistPendingOtpLogin({
        email: otpEmail,
        role,
        accountType: modalAccountType,
        ...(devOtp ? { devOtp } : {}),
      });
      const params = new URLSearchParams();
      params.set("type", modalAccountType);
      params.set("email", otpEmail);
      params.set("redirect", loginRedirectPath);
      onClose();
      window.location.href = `/login-otp?${params.toString()}`;
    },
    [loginRedirectPath, onClose],
  );

  const handleGoogleCredentialResponse = useCallback(
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
          devOtp?: string;
          token?: string;
          user?: SafeAuthUser;
        }>("/api/users/login/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential, accountType: modalAccountType }),
        });

        if (data.requiresOtp && data.email && data.role) {
          redirectToOtpStep(data.email, data.role, data.devOtp);
          return;
        }

        if (data.token && data.user) {
          const safeUser: SafeAuthUser = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone,
            role: data.user.role,
          };
          persistAuth(data.token, safeUser);
          if (safeUser.role === "admin") {
            setStatus({ type: "success", text: data.message || "Admin login successful." });
            onClose();
            window.location.href = "/admin";
            return;
          }
          onAuthenticated(safeUser);
          onClose();
          setStatus({ type: "success", text: data.message || "Login successful." });
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
    [onAuthenticated, onClose, redirectToOtpStep],
  );

  useEffect(() => {
    if (window.google?.accounts?.id) {
      setIsGoogleScriptReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const storedMode =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem("collegeedwiser-find-auth-mode")
        : null;
    setAuthMode(storedMode === "register" ? "register" : "login");
  }, [isOpen]);

  useEffect(() => {
    if (!googleClientId || !isGoogleScriptReady || !googleButtonRef.current || !googleButtonShellRef.current) {
      return;
    }

    const shell = googleButtonShellRef.current;
    const syncGoogleButtonWidth = () => {
      const nextWidth = Math.round(Math.max(220, Math.min(420, shell.offsetWidth || 0)));
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
  }, [isGoogleScriptReady, isOpen]);

  useEffect(() => {
    if (!googleClientId || !isGoogleScriptReady || !googleButtonRef.current || !googleButtonWidth) {
      return;
    }

    const googleAccountsId = window.google?.accounts?.id;
    if (!googleAccountsId) return;

    googleAccountsId.initialize({
      client_id: googleClientId,
      callback: handleGoogleCredentialResponse,
    });

    googleButtonRef.current.innerHTML = "";
    googleAccountsId.renderButton(googleButtonRef.current, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      width: googleButtonWidth,
      logo_alignment: "left",
    });
  }, [googleButtonWidth, isGoogleScriptReady, handleGoogleCredentialResponse]);

  const cutoffLabelClass = "mb-2 block text-[14px] font-semibold text-[#0F1B25]";
  const cutoffFieldShellClass =
    "flex h-12 items-center gap-3 rounded-[6px] border border-[#DDE2E7] bg-white px-3 shadow-[0_5px_14px_rgba(15,27,37,0.04)] transition focus-within:border-[#0856dc] focus-within:shadow-[0_0_0_4px_rgba(23,53,111,0.12)]";
  const cutoffFieldInputClass =
    "h-full w-full border-0 bg-transparent p-0 text-[16px] font-normal text-[#0F1B25] outline-none placeholder:text-[#8A949F]";
  const cutoffPrimaryButtonClass =
    "inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#0856dc] px-6 text-[16px] font-medium text-white shadow-[0_10px_18px_rgba(23,53,111,0.22)] transition hover:bg-white hover:text-[#0856dc] disabled:cursor-not-allowed disabled:opacity-60";
  const cutoffSecondaryButtonClass =
    "inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] border border-[#E6E6E6] bg-white px-6 text-[16px] font-medium text-[#0F1B25] shadow-[0_5px_14px_rgba(15,27,37,0.04)] transition hover:bg-[#eef4ff]";
  const registerFieldShellClass =
    "flex h-11 items-center gap-3 rounded-[6px] border border-[#DDE2E7] bg-white px-3 shadow-[0_5px_14px_rgba(15,27,37,0.04)]";
  const registerFieldInputClass =
    "h-full w-full border-0 bg-transparent p-0 text-[15px] font-normal text-[#0F1B25] outline-none placeholder:text-[#8A949F]";
  const registerPrimaryButtonClass =
    "inline-flex h-11 w-full items-center justify-center gap-2 rounded-[6px] bg-[#0856dc] px-5 text-[15px] font-medium text-white shadow-[0_10px_18px_rgba(23,53,111,0.22)] transition hover:bg-white hover:text-[#0856dc] disabled:cursor-not-allowed disabled:opacity-60";

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsLoginLoading(true);

    try {
      const data = (await request("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          accountType: modalAccountType,
        }),
      })) as {
        message?: string;
        requiresOtp?: boolean;
        email?: string;
        role?: string;
        devOtp?: string;
        token?: string;
        user?: SafeAuthUser;
      };

      if (data?.token && data?.user?.role === "admin") {
        persistAuth(data.token, {
          id: String(data.user.id || "admin"),
          name: data.user.name || "Admin",
          email: data.user.email || loginEmail.trim(),
          role: "admin",
        });
        setStatus({
          type: "success",
          text: data.message || "Admin login successful.",
        });
        onClose();
        window.location.href = "/admin";
        return;
      }

      if (data.requiresOtp && data.email && data.role) {
        redirectToOtpStep(data.email, data.role, data.devOtp);
        return;
      }

      if (data?.token && data?.user) {
        const safeUser: SafeAuthUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          role: data.user.role,
        };
        persistAuth(data.token, safeUser);
        onAuthenticated(safeUser);
        onClose();
        setStatus({
          type: "success",
          text: data.message || "Login successful.",
        });
        return;
      }

      setStatus({
        type: "error",
        text: data.message || "Login could not continue.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Login failed.",
      });
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidIndianPhone(registerPhone)) {
      setStatus({ type: "error", text: "Enter a valid 10 digit mobile number." });
      return;
    }

    setStatus(null);
    setIsRegisterLoading(true);
    try {
      const data = (await request("/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
          phone: registerPhone,
          accountType: modalAccountType,
        }),
      })) as {
        message?: string;
        user?: SafeAuthUser;
        token?: string;
      };

      if (data?.token && data?.user) {
        const safeUser: SafeAuthUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          role: data.user.role,
        };
        persistAuth(data.token, safeUser);
        onAuthenticated(safeUser);
        onClose();
        setStatus({
          type: "success",
          text: data.message || "Signup successful.",
        });
        return;
      }

      setStatus({
        type: "success",
        text: data.message || "Signup successful. Please login to continue.",
      });
      switchAuthMode("login");
      setLoginEmail(registerEmail);
      setLoginPassword("");
      setRegisterPassword("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Signup failed.";
      setStatus({
        type: "error",
        text: errorMessage,
      });
      if (/already registered/i.test(errorMessage)) {
        switchAuthMode("login");
        setLoginEmail(registerEmail);
      }
    } finally {
      setIsRegisterLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-[rgba(7,20,38,0.48)] px-3 py-4 backdrop-blur-[5px] sm:px-4 sm:py-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="find-auth-modal-title"
        className="relative flex h-fit max-h-[calc(100dvh-1.5rem)] w-full max-w-[395px] flex-col sm:max-h-[calc(100dvh-2.25rem)] sm:max-w-[420px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="find-auth-stage relative z-10">
          <div
              key={authFlipKey}
              className={`find-auth-panel relative flex flex-col overflow-hidden rounded-[1.6rem] border border-[#bfdbfe] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_38%,#eef4ff_100%)] px-4 pt-6 shadow-[0_30px_90px_rgba(31,24,4,0.22)] sm:px-8 sm:pt-7 ${
                authFlipDirection === "right" ? "find-auth-panel-from-right" : "find-auth-panel-from-left"
              }`}
            >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(23,53,111,0.12)_0%,rgba(255,255,255,0)_60%)]" />
            </div>

              <div className="absolute right-4 top-4 z-20">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex size-10 items-center justify-center rounded-full border border-[rgba(15,76,129,0.08)] bg-white text-[color:var(--text-muted)] transition hover:bg-[rgba(15,76,129,0.04)] hover:text-[color:var(--text-dark)]"
                  aria-label="Close authentication popup"
                >
                  <X className="size-4.5" />
                </button>
              </div>

              <div className="text-center">
                <h2
                  id="find-auth-modal-title"
                  className="text-[22px] font-semibold leading-tight text-[#0F1B25] sm:text-[24px]"
                >
                  {isLoginMode ? "Access Your Dashboard" : "Create your account"}
                </h2>
              </div>

              <div className="mt-4 pb-6 sm:pb-7">
              {isLoginMode ? (
                <div className="mt-0">
                  <form onSubmit={handleLoginSubmit} className="space-y-3">
                    <div>
                      <label className={cutoffLabelClass}>Email Address</label>
                      <div className={cutoffFieldShellClass}>
                        <Mail className="size-4 shrink-0 text-[#5F6B76]" />
                        <input
                          type="email"
                          value={loginEmail}
                          onChange={(event) => setLoginEmail(event.target.value)}
                          className={cutoffFieldInputClass}
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className={cutoffLabelClass}>Password</label>
                      <div className={cutoffFieldShellClass}>
                        <Lock className="size-4 shrink-0 text-[#5F6B76]" />
                        <input
                          type={showLoginPassword ? "text" : "password"}
                          value={loginPassword}
                          onChange={(event) => setLoginPassword(event.target.value)}
                          className={cutoffFieldInputClass}
                          placeholder="Enter your password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword((current) => !current)}
                          className="ml-auto inline-flex size-8 items-center justify-center text-[#5F6B76] transition hover:text-[#0F1B25]"
                        >
                          {showLoginPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 text-[0.9rem] sm:flex-row sm:items-center sm:justify-between">
                      <Link
                        href="/forgot-password"
                        className="font-semibold text-[color:var(--brand-primary)] transition hover:text-[color:var(--brand-primary-soft)]"
                      >
                        Forgot Password?
                      </Link>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoginLoading}
                      className={cutoffPrimaryButtonClass}
                    >
                      {isLoginLoading ? "Signing in..." : "Login"}
                      <ArrowRight className="size-4" />
                    </button>
                  </form>

                    <div className="mt-4">
                    <div className="relative mb-3">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-[#dbeafe]" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-3 tracking-[0.18em] text-[#6f7b8c]">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <div className="px-1 py-1">
                      {googleClientId ? (
                        <div
                          ref={googleButtonShellRef}
                          className={`group google-cta-frame relative mx-auto w-full max-w-[360px] ${
                            isGoogleLoading ? "opacity-80" : ""
                          }`}
                        >
                          <div className={`${cutoffSecondaryButtonClass} pointer-events-none text-left group-hover:bg-[#eef4ff]`}>
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#eef4ff]">
                              <GoogleMark className="size-4.5" />
                            </span>
                            <span className="min-w-0 flex-1 text-[16px] font-medium text-[#0F1B25]">
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
                          className={cutoffSecondaryButtonClass}
                        >
                          Google login not configured
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="mt-4 text-center text-[0.9rem] text-[#536079]">
                    New here?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        window.sessionStorage.setItem("collegeedwiser-find-auth-mode", "register");
                        switchAuthMode("register");
                      }}
                      className="font-semibold text-[#0856dc] transition hover:underline"
                    >
                      Create Account
                    </button>
                  </p>
                </div>
              ) : (
                <div className="mt-0">
                  <form onSubmit={handleRegisterSubmit} className="space-y-3">
                    <div>
                      <label className={cutoffLabelClass}>Full Name</label>
                      <div className={registerFieldShellClass}>
                        <User className="size-4 shrink-0 text-[#5F6B76]" />
                        <input
                          type="text"
                          value={registerName}
                          onChange={(event) => setRegisterName(event.target.value)}
                          className={registerFieldInputClass}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className={cutoffLabelClass}>Email Address</label>
                      <div className={registerFieldShellClass}>
                        <Mail className="size-4 shrink-0 text-[#5F6B76]" />
                        <input
                          type="email"
                          value={registerEmail}
                          onChange={(event) => setRegisterEmail(event.target.value)}
                          className={registerFieldInputClass}
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className={cutoffLabelClass}>Mobile Number</label>
                      <div className={registerFieldShellClass}>
                        <Phone className="size-4 shrink-0 text-[#5F6B76]" />
                        <input
                          type="tel"
                          value={registerPhone}
                          onChange={(event) => setRegisterPhone(normalizeIndianPhoneInput(event.target.value))}
                          className={registerFieldInputClass}
                          placeholder="10 digit mobile number"
                          inputMode="numeric"
                          maxLength={10}
                          required
                        />
                      </div>
                      {registerPhone && !isValidIndianPhone(registerPhone) ? (
                        <p className="mt-2 text-xs font-medium text-red-600">
                          Enter a valid 10 digit mobile number
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label className={cutoffLabelClass}>Password</label>
                      <div className={registerFieldShellClass}>
                        <Lock className="size-4 shrink-0 text-[#5F6B76]" />
                        <input
                          type={showRegisterPassword ? "text" : "password"}
                          value={registerPassword}
                          onChange={(event) => setRegisterPassword(event.target.value)}
                          className={registerFieldInputClass}
                          placeholder="Create a secure password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword((current) => !current)}
                          className="ml-auto inline-flex size-8 items-center justify-center text-[#5F6B76] transition hover:text-[#0F1B25]"
                        >
                          {showRegisterPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isRegisterLoading}
                      className={registerPrimaryButtonClass}
                    >
                      {isRegisterLoading ? "Creating account..." : "Create Account"}
                      <ArrowRight className="size-4" />
                    </button>
                  </form>

                  <p className="mt-4 text-center text-[0.9rem] text-[#536079]">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        window.sessionStorage.setItem("collegeedwiser-find-auth-mode", "login");
                        switchAuthMode("login");
                      }}
                      className="font-semibold text-[#0856dc] transition hover:underline"
                    >
                      Login Now
                    </button>
                  </p>
                </div>
              )}
              </div>
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
    </div>
  );
}

