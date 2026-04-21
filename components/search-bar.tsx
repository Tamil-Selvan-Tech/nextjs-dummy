"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export function SearchBar() {
  const router = useRouter();

  const openSearchPage = () => {
    router.push("/search");
  };

  return (
    <button
      type="button"
      onClick={openSearchPage}
      className="group relative flex h-14 w-full items-center rounded-full border border-[rgba(239,68,68,0.3)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(247,242,232,0.96))] pl-16 pr-5 text-left text-[15px] text-slate-500 shadow-[0_18px_40px_rgba(8,17,31,0.12)] outline-none transition hover:border-[rgba(239,68,68,0.55)] hover:shadow-[0_22px_50px_rgba(8,17,31,0.18)] focus-visible:border-[rgba(239,68,68,0.7)] focus-visible:shadow-[0_22px_50px_rgba(8,17,31,0.18)]"
      aria-label="Open search page"
    >
      <span className="pointer-events-none absolute inset-y-1.5 left-1.5 flex items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(239,68,68,0.24),rgba(255,255,255,0.7))] px-3.5 text-[color:var(--brand-primary)] transition group-hover:scale-105 group-focus-visible:scale-105">
        <Search className="size-[18px]" />
      </span>
      <span>Search colleges, courses and careers</span>
    </button>
  );
}
