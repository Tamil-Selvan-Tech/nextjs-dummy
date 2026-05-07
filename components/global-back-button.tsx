"use client";

import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { navigateToSafeBack } from "@/lib/safe-back";

type PageBackButtonProps = {
  className?: string;
};

export function PageBackButton({ className = "" }: PageBackButtonProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentRoute = useMemo(() => {
    if (!pathname) return "/";
    const query =
      typeof window === "undefined"
        ? ""
        : window.location.search.replace(/^\?/, "").trim();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname]);

  if (!pathname || pathname === "/") return null;

  const handleBack = () => {
    navigateToSafeBack(router, currentRoute, "/");
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-2 rounded-full border border-[rgba(15,76,129,0.12)] bg-white/96 px-4 py-2 text-[13px] font-semibold text-slate-900 shadow-[0_12px_28px_rgba(22,50,79,0.12)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_34px_rgba(22,50,79,0.16)] ${className}`.trim()}
      aria-label="Go back"
    >
      <ArrowLeft className="size-4" />
      Back
    </button>
  );
}
