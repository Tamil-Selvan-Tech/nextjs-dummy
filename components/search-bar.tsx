"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/search?q=${encodeURIComponent(value)}` : "/search");
  };

  return (
    <form onSubmit={onSubmit} className="group relative">
      <div className="pointer-events-none absolute inset-y-1 left-1 flex items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(239,68,68,0.24),rgba(255,255,255,0.7))] px-3 text-[color:var(--brand-primary)] transition group-focus-within:scale-105">
        <Search className="size-4" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => router.push(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search")}
        placeholder="Search colleges, courses and careers"
        className="h-12 w-full rounded-full border border-[rgba(239,68,68,0.3)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(247,242,232,0.96))] pl-14 pr-4 text-sm text-slate-700 shadow-[0_18px_40px_rgba(8,17,31,0.12)] outline-none transition placeholder:text-slate-500 focus:border-[rgba(239,68,68,0.7)] focus:shadow-[0_22px_50px_rgba(8,17,31,0.18)]"
      />
    </form>
  );
}
