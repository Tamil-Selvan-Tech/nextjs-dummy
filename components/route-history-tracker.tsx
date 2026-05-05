"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { registerVisitedPath } from "@/lib/safe-back";

export function RouteHistoryTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentRoute = useMemo(() => {
    if (!pathname) return "";
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!currentRoute) return;
    registerVisitedPath(currentRoute);
  }, [currentRoute]);

  return null;
}
