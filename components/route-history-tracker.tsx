"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { registerVisitedPath } from "@/lib/safe-back";

export function RouteHistoryTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    const query =
      typeof window === "undefined"
        ? ""
        : window.location.search.replace(/^\?/, "").trim();
    const currentRoute = query ? `${pathname}?${query}` : pathname;
    registerVisitedPath(currentRoute);
  }, [pathname]);

  return null;
}
