"use client";

const SAFE_BACK_HISTORY_KEY = "collegeedwiser-safe-back-history";
const BLOCKED_BACK_PREFIXES = ["/login", "/signup", "/login-otp"];
const MAX_HISTORY_ENTRIES = 40;

const normalizePath = (pathname: string) => pathname.trim() || "/";
const getRoutePathname = (route: string) => normalizePath(route.split("?")[0] || "/");

export const isBlockedBackPath = (pathname: string) =>
  BLOCKED_BACK_PREFIXES.some(
    (prefix) => getRoutePathname(pathname) === prefix || getRoutePathname(pathname).startsWith(`${prefix}/`),
  );

const readHistory = () => {
  if (typeof window === "undefined") return [] as string[];

  try {
    const rawHistory = window.sessionStorage.getItem(SAFE_BACK_HISTORY_KEY);
    if (!rawHistory) return [];

    const parsedHistory = JSON.parse(rawHistory);
    return Array.isArray(parsedHistory)
      ? parsedHistory.filter((entry): entry is string => typeof entry === "string")
      : [];
  } catch {
    return [];
  }
};

const writeHistory = (history: string[]) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(
    SAFE_BACK_HISTORY_KEY,
    JSON.stringify(history.slice(-MAX_HISTORY_ENTRIES)),
  );
};

export const registerVisitedPath = (pathname: string) => {
  const nextPath = normalizePath(pathname);
  const history = readHistory();

  if (history[history.length - 1] === nextPath) return;

  writeHistory([...history, nextPath]);
};

export const getSafeBackDestination = (currentPathname: string, fallback = "/") => {
  const currentPath = normalizePath(currentPathname);
  const candidateHistory = [...readHistory()];

  while (candidateHistory[candidateHistory.length - 1] === currentPath) {
    candidateHistory.pop();
  }

  for (let index = candidateHistory.length - 1; index >= 0; index -= 1) {
    const candidate = normalizePath(candidateHistory[index]);
    if (!candidate || candidate === currentPath || isBlockedBackPath(candidate)) continue;
    return candidate;
  }

  return fallback;
};

const pruneHistoryAfterBackNavigation = (currentPathname: string, destination: string) => {
  const currentPath = normalizePath(currentPathname);
  const targetPath = normalizePath(destination);
  const history = [...readHistory()];

  while (history[history.length - 1] === currentPath) {
    history.pop();
  }

  while (history.length > 0) {
    const candidate = normalizePath(history[history.length - 1]);
    if (candidate === targetPath) break;
    history.pop();
  }

  if (history[history.length - 1] !== targetPath) {
    history.push(targetPath);
  }

  writeHistory(history);
};

export const navigateToSafeBack = (
  router: { push: (href: string) => void; replace?: (href: string) => void },
  currentPathname: string,
  fallback = "/",
) => {
  const destination = getSafeBackDestination(currentPathname, fallback);
  pruneHistoryAfterBackNavigation(currentPathname, destination);

  if (typeof router.replace === "function") {
    router.replace(destination);
    return;
  }

  router.push(destination);
};
