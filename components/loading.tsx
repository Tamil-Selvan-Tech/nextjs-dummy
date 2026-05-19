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
      className={`fixed inset-0 z-[100] overflow-hidden bg-[#FCFCFA] ${
        fullScreen ? "min-h-screen" : "min-h-[24rem]"
      }`}
    >
      {/* soft background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(253,224,71,0.10),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(253,224,71,0.10),transparent_28%)]" />

      {/* top right pattern */}
      <div className="absolute right-8 top-8 grid grid-cols-5 gap-2 opacity-30">
        {Array.from({ length: 25 }).map((_, i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-slate-300"
          />
        ))}
      </div>

      {/* center content */}
      <div
        className={`relative z-10 flex items-center justify-center ${
          fullScreen ? "min-h-screen" : "min-h-[24rem]"
        }`}
      >
        <div className="flex flex-col items-center">
          
          {/* animated loader */}
          <div className="relative flex items-center gap-4">
            <span className="h-3.5 w-3.5 animate-bounce rounded-full bg-[#1E3A8A]" />

            <span
              className="h-5 w-5 animate-bounce rounded-full bg-[#2563EB]"
              style={{ animationDelay: "0.15s" }}
            />

            <span
              className="h-7 w-7 animate-bounce rounded-full bg-[#0F172A]"
              style={{ animationDelay: "0.3s" }}
            />
          </div>

          {/* loading text */}
          <p className="mt-6 text-[13px] font-semibold tracking-[0.45em] text-slate-500 uppercase">
            {label}
          </p>

          {/* logo */}
          <div className="mt-10 flex flex-col items-center">
            
            {/* logo container */}
            <div>
              <BrandLogo
                textColor="dark"
                className="h-10 opacity-95"
              />
            </div>

            {/* soft shadow */}
            <div className="mt-2 h-3 w-28 rounded-full bg-slate-200/40 blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
