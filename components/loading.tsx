"use client";

import { LoaderCircle, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

type LoadingProps = {
  label?: string;
  fullScreen?: boolean;
};

export function Loading({
  label = "Loading your next step...",
  fullScreen = true,
}: LoadingProps) {
  return (
    <section
      className={`fixed inset-0 z-[100] overflow-hidden bg-[linear-gradient(180deg,#eef4fb_0%,#e7eef8_100%)] text-[color:var(--text-dark)] ${
        fullScreen ? "min-h-screen" : "min-h-[24rem]"
      }`}
    >
      <div className="absolute inset-0">
        <div className="absolute left-[-4rem] top-12 h-52 w-52 rounded-full bg-[rgba(60,126,182,0.1)] blur-3xl" />
        <div className="absolute right-[-3rem] top-20 h-44 w-44 rounded-full bg-[rgba(255,138,61,0.12)] blur-3xl" />
      </div>

      <div
        className={`relative z-10 flex items-center justify-center px-4 py-10 ${
          fullScreen ? "min-h-screen" : "min-h-[24rem]"
        }`}
      >
        <div className="w-full max-w-md rounded-[1.8rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,249,255,0.96))] p-6 text-center shadow-[0_28px_64px_rgba(22,50,79,0.12)] md:p-8">
          <div className="mx-auto flex max-w-sm flex-col items-center">
            <div className="rounded-[1.4rem] border border-[rgba(15,76,129,0.08)] bg-white px-5 py-4 shadow-[0_18px_40px_rgba(22,50,79,0.08)]">
              <BrandLogo textColor="dark" />
            </div>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[rgba(15,76,129,0.06)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-primary)]">
              <Sparkles className="size-3.5" />
              Loading
            </div>

            <div className="mt-5 flex items-center gap-3">
              <LoaderCircle className="size-5 animate-spin text-[color:var(--brand-primary)]" />
              <p className="text-sm font-semibold text-[color:var(--text-dark)] md:text-base">
                {label}
              </p>
            </div>

            <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
              Preparing the page with the same clean College EdwiseR experience.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
