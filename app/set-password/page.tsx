"use client";

import { useEffect, useState } from "react";
import { KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { request } from "@/lib/api";

export default function SetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [tempPassword, setTempPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const [isValidInvite, setIsValidInvite] = useState(false);
  const [status, setStatus] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const validateInvite = async () => {
      if (!email || !token) {
        if (isMounted) {
          setStatus({ type: "error", text: "Invalid invite link." });
          setIsChecking(false);
        }
        return;
      }

      try {
        await request("/api/admin/sub-admins/validate-invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, token }),
        });

        if (isMounted) {
          setIsValidInvite(true);
        }
      } catch (error) {
        if (isMounted) {
          setStatus({
            type: "error",
            text: error instanceof Error ? error.message : "Invite link validation failed.",
          });
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    void validateInvite();

    return () => {
      isMounted = false;
    };
  }, [email, token]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    if (!tempPassword) {
      setStatus({ type: "error", text: "Temporary password is required." });
      return;
    }
    if (!newPassword || !confirmPassword) {
      setStatus({ type: "error", text: "Both password fields are required." });
      return;
    }
    if (newPassword.length < 6) {
      setStatus({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (!email || !token) {
      setStatus({ type: "error", text: "Invalid invite link." });
      return;
    }

    setIsLoading(true);
    try {
      const data = await request("/api/admin/sub-admins/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          oldPassword: tempPassword,
          newPassword,
          confirmPassword,
        }),
      });

      setStatus({
        type: "success",
        text: data.message || "Password set successfully. Please login.",
      });
      window.setTimeout(() => router.push("/login"), 1200);
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to set password.",
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
        <div className="mx-auto grid min-h-[88vh] max-w-6xl overflow-hidden rounded-[1.8rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,251,255,0.95))] shadow-[0_30px_80px_rgba(4,12,26,0.14)] lg:grid-cols-[0.95fr_1.05fr] lg:rounded-[2.2rem]">
          <aside className="relative hidden overflow-hidden border-r border-[rgba(15,76,129,0.08)] p-6 lg:flex lg:flex-col lg:justify-between xl:p-8">
            <div className="absolute left-[-4rem] top-12 h-44 w-44 rounded-full bg-[rgba(60,126,182,0.1)] blur-3xl" />
            <div className="absolute bottom-0 right-[-3rem] h-40 w-40 rounded-full bg-[rgba(255,138,61,0.12)] blur-3xl" />

            <div className="relative z-10">
              <BrandLogo textColor="dark" className="h-10" />
              <div className="mt-5 inline-flex rounded-full border border-[rgba(15,76,129,0.12)] bg-[rgba(15,76,129,0.06)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-primary)]">
                <Sparkles className="mr-2 size-3.5" />
                Admin Invite
              </div>
            </div>

            <div className="relative z-10 rounded-[2rem] border border-[rgba(15,76,129,0.1)] bg-[linear-gradient(180deg,#ffffff,#eff6ff)] p-8 shadow-[0_22px_50px_rgba(22,50,79,0.1)]">
              <ShieldCheck className="mb-5 size-12 text-[color:var(--brand-primary)]" />
              <h2 className="font-[family:var(--font-display)] text-3xl leading-none text-[color:var(--text-dark)]">
                Set your admin password
              </h2>
              <p className="mt-4 text-sm leading-7 text-[color:var(--text-muted)]">
                Complete your invite with a secure password and continue into the
                admin access flow.
              </p>
            </div>

            <p className="relative z-10 max-w-sm text-sm leading-7 text-[color:var(--text-muted)]">
              This page validates the invite link first and then updates the password
              through the backend admin endpoints.
            </p>
          </aside>

          <main className="flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
            <div className="w-full max-w-md sm:max-w-lg lg:max-w-md">
              <div className="mb-7 text-center">
                <BrandLogo variant="tab" className="mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-[color:var(--text-dark)]">Set Your Password</h1>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                  Create a secure password to access your account.
                </p>
              </div>

              {isChecking ? (
                <div className="rounded-[1.2rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-4 text-center text-sm font-medium text-[color:var(--text-muted)]">
                  Validating invite link...
                </div>
              ) : null}

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

              {!isChecking && isValidInvite ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                      Temporary Password
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
                      <input
                        type="password"
                        value={tempPassword}
                        onChange={(event) => setTempPassword(event.target.value)}
                        placeholder="Enter temporary password"
                        required
                        className="w-full rounded-[1.1rem] border border-[rgba(15,76,129,0.12)] bg-white py-3 pl-10 pr-4 text-sm text-[color:var(--text-dark)] outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                      New Password
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        placeholder="Enter new password"
                        required
                        className="w-full rounded-[1.1rem] border border-[rgba(15,76,129,0.12)] bg-white py-3 pl-10 pr-4 text-sm text-[color:var(--text-dark)] outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Confirm password"
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
                    {isLoading ? "Setting Password..." : "Set Password"}
                  </button>
                </form>
              ) : null}

              <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--brand-primary)] transition hover:text-[color:var(--brand-primary-soft)]"
              >
                Back to login
              </Link>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}
