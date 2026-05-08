"use client";

import { BrandLogo } from "@/components/brand-logo";

type LoadingProps = {
  label?: string;
  fullScreen?: boolean;
};

export function Loading({
  label = "Loading...",
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
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto flex flex-col items-center">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-28 w-28 rounded-full border border-[rgba(15,76,129,0.14)] animate-ping" />
              <div className="absolute h-36 w-36 rounded-full border-2 border-dashed border-[rgba(47,106,163,0.25)] animate-spin" />
              <div className="absolute h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.9),rgba(255,255,255,0))] blur-2xl" />
              <div className="relative rounded-[1.6rem] border border-[rgba(15,76,129,0.08)] bg-white/94 px-6 py-5 shadow-[0_24px_56px_rgba(22,50,79,0.12)] backdrop-blur-sm">
                <BrandLogo textColor="dark" className="h-10" />
              </div>
            </div>

            <div className="mt-7 flex items-center gap-3">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[color:var(--brand-primary)]" />
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[color:var(--brand-primary-soft)] [animation-delay:180ms]" />
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[color:var(--brand-accent)] [animation-delay:360ms]" />
            </div>

            <p className="mt-5 bg-[linear-gradient(90deg,var(--brand-primary),var(--brand-primary-soft),var(--brand-accent-deep))] bg-clip-text text-sm font-bold tracking-[0.18em] text-transparent uppercase">
              {label}
            </p>

            <div className="mt-4 h-1.5 w-36 overflow-hidden rounded-full bg-white/70 shadow-[inset_0_1px_2px_rgba(15,76,129,0.08)]">
              <div className="h-full w-1/2 rounded-full bg-[linear-gradient(90deg,var(--brand-primary),var(--brand-accent))] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
