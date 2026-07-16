"use client";

import { Building2, Calculator, Home, Medal, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { readCurrentUser, type SafeAuthUser } from "@/lib/auth-storage";

export function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<SafeAuthUser | null>(() => readCurrentUser());
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [isLoadingScreenVisible, setIsLoadingScreenVisible] = useState(false);
  const [isNotFoundScreenVisible, setIsNotFoundScreenVisible] = useState(false);
  const [isTopOverlayOpen, setIsTopOverlayOpen] = useState(false);

  useEffect(() => {
    const syncCurrentUser = () => {
      setCurrentUser(readCurrentUser());
    };

    syncCurrentUser();
    window.addEventListener("storage", syncCurrentUser);
    window.addEventListener("focus", syncCurrentUser);

    return () => {
      window.removeEventListener("storage", syncCurrentUser);
      window.removeEventListener("focus", syncCurrentUser);
    };
  }, []);

  useEffect(() => {
    const footerElement = document.querySelector<HTMLElement>(".site-footer");
    if (!footerElement) {
      setIsFooterVisible(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      {
        threshold: 0.12,
      },
    );

    observer.observe(footerElement);

    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const syncPageMarkers = () => {
      setIsLoadingScreenVisible(Boolean(document.querySelector('[data-app-page="loading"]')));
      setIsNotFoundScreenVisible(Boolean(document.querySelector('[data-app-page="not-found"]')));
      setIsTopOverlayOpen(document.body.dataset.mobileTopOverlayOpen === "true");
    };

    syncPageMarkers();

    const observer = new MutationObserver(syncPageMarkers);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-app-page", "data-mobile-top-overlay-open"],
    });

    return () => observer.disconnect();
  }, [pathname]);

  const profileTargetHref =
    currentUser?.role === "admin"
      ? "/admin"
      : currentUser?.role === "college"
        ? "/college-dashboard"
        : currentUser
          ? "/account"
          : "/login";

  const isProfilePage =
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/college-dashboard" ||
    pathname.startsWith("/college-dashboard/");

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/login-otp" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/set-password" ||
    pathname === "/verify-email";

  const shouldHideNav =
    isFooterVisible ||
    isProfilePage ||
    isAuthPage ||
    isLoadingScreenVisible ||
    isNotFoundScreenVisible ||
    isTopOverlayOpen;

  const items = [
    { label: "Home", href: "/", icon: Home },
    { label: "Colleges", href: "/explore?view=colleges", icon: Building2 },
    { label: "Exams", href: "/exams", icon: Medal },
    { label: "Cutoff", href: "/find", icon: Calculator },
    { label: "Profile", href: profileTargetHref, icon: UserRound },
  ] as const;

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className={`fixed inset-x-0 bottom-0 z-40 md:hidden transition-all duration-200 ${shouldHideNav ? "pointer-events-none translate-y-full opacity-0" : "translate-y-0 opacity-100"}`}
    >
      <div className="mx-0 rounded-t-[1.35rem] rounded-b-none border border-[rgba(15,23,42,0.06)] border-b-0 bg-[rgba(255,255,255,0.96)] p-1.5 pb-[calc(0.35rem+env(safe-area-inset-bottom))] shadow-[0_16px_36px_rgba(20,42,99,0.12)] backdrop-blur-md">
        <div className="grid grid-cols-5 gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              (item.label === "Home" && pathname === "/") ||
              (item.label === "Colleges" && pathname?.startsWith("/explore")) ||
              (item.label === "Exams" && pathname?.startsWith("/exams")) ||
              (item.label === "Cutoff" && pathname?.startsWith("/find")) ||
              (item.label === "Profile" && pathname === profileTargetHref);

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => router.push(item.href)}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-[4.25rem] min-w-0 flex-col items-center justify-center gap-0.5 rounded-[1.15rem] px-1 py-1.5 text-center transition ${
                  isActive
                    ? "bg-[linear-gradient(180deg,#1f4bb8_0%,#17358b_100%)] text-white shadow-[0_12px_26px_rgba(30,64,175,0.24)]"
                    : "bg-transparent text-[color:var(--text-muted)] hover:bg-[rgba(37,99,235,0.05)] hover:text-[color:var(--brand-primary)]"
                }`}
              >
                <Icon className={`size-5 shrink-0 ${isActive ? "text-white" : "text-[color:var(--brand-primary-soft)]"}`} />
                <span className="text-[0.68rem] font-medium leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
