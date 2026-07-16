"use client";

import { BrandLogo } from "@/components/brand-logo";
import { BookOpen, GraduationCap, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

const LOADING_STATES = [
  {
    key: "colleges",
    icon: MapPin,
    iconColor: "text-[#22C55E]",
    glowColor: "bg-[rgba(34,197,94,0.18)]",
  },
  {
    key: "top-colleges",
    icon: GraduationCap,
    iconColor: "text-[#2563EB]",
    glowColor: "bg-[rgba(37,99,235,0.18)]",
  },
  {
    key: "courses",
    icon: BookOpen,
    iconColor: "text-[#F59E0B]",
    glowColor: "bg-[rgba(245,158,11,0.18)]",
  },
] as const;

const LOADING_TITLE = "Preparing your education journey...";

type LoadingProps = {
  fullScreen?: boolean;
};

export function Loading({ fullScreen = true }: LoadingProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const readyTimer = window.setTimeout(() => setIsReady(true), 50);

    if (reduceMotion) {
      setIsReady(true);
      return () => window.clearTimeout(readyTimer);
    }

    const rotateTimer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % LOADING_STATES.length);
    }, 1100);

    return () => {
      window.clearTimeout(readyTimer);
      window.clearInterval(rotateTimer);
    };
  }, []);

  return (
    <section
      data-app-page="loading"
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`overflow-hidden bg-[#FAFAFA] text-slate-900 ${
        fullScreen ? "fixed inset-0 z-[100] min-h-screen" : "relative min-h-[24rem]"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.05),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.05),transparent_34%)]" />

      <div className="relative z-10 flex min-h-full items-center justify-center px-4 py-10">
        <div className="flex w-full max-w-[30rem] flex-col items-center text-center">
          <div className="flex justify-center">
            <BrandLogo variant="full" textColor="dark" className="scale-[1.08] sm:scale-[1.14]" />
          </div>

          <div className="h-10 sm:h-11" />

          <div className="flex items-center justify-center gap-4 sm:gap-5" aria-hidden="true">
            {LOADING_STATES.map((state, index) => {
              const Icon = state.icon;
              const isActive = isReady && index === activeIndex;

              return (
                <div
                  key={state.key}
                  className="relative flex h-9 w-9 items-center justify-center sm:h-10 sm:w-10"
                >
                  <span
                    className={`absolute inset-0 rounded-full blur-xl transition-all duration-[900ms] ease-in-out ${
                      isActive ? `${state.glowColor} scale-150 opacity-100` : "scale-75 opacity-0"
                    }`}
                  />

                  <span
                    className={`relative flex items-center justify-center rounded-full transition-all duration-[900ms] ease-in-out ${
                      isActive ? "h-9 w-9 bg-transparent sm:h-10 sm:w-10" : "h-2 w-2 bg-slate-300"
                    }`}
                  >
                    <span
                      className={`transition-all duration-[900ms] ease-in-out ${
                        isActive ? "scale-100 opacity-100" : "scale-75 opacity-0"
                      }`}
                    >
                      <Icon className={`size-7 ${state.iconColor}`} strokeWidth={2.2} />
                    </span>
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-8 space-y-2">
            <h1 className="font-[family:var(--font-inter)] text-[18px] font-semibold leading-6 text-slate-900 motion-safe:animate-[pulse_2.1s_ease-in-out_infinite] sm:text-[19px]">
              {LOADING_TITLE}
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}
