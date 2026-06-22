export const LOCAL_API_BASE_URL = "http://localhost:5000";
export const REMOTE_FALLBACK_BASE_URL = "https://college-edwiser-backend-nz7v.onrender.com";

const configuredApiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.VITE_API_BASE_URL || "";

const isLocalApiBaseUrl = (value: string) =>
  value.includes("localhost:5000") || value.includes("127.0.0.1:5000");

const isLocalBrowser =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const shouldUseConfiguredApiBaseUrl =
  Boolean(configuredApiBaseUrl) &&
  (process.env.NODE_ENV !== "production" || isLocalBrowser || !isLocalApiBaseUrl(configuredApiBaseUrl));

const DEFAULT_API_BASE_URL =
  (shouldUseConfiguredApiBaseUrl ? configuredApiBaseUrl : "") ||
  (isLocalBrowser || process.env.NODE_ENV !== "production"
    ? LOCAL_API_BASE_URL
    : REMOTE_FALLBACK_BASE_URL);

export const API_BASE_URL = (
  DEFAULT_API_BASE_URL
).replace(/\/$/, "");

const shouldTryRemoteFallback = isLocalApiBaseUrl(API_BASE_URL);
const AUTH_ENDPOINT_PREFIXES = [
  "/api/users/login",
  "/api/users/verify-login-otp",
  "/api/users/resend-login-otp",
];

const shouldAvoidRemoteFallback = (path: string) =>
  AUTH_ENDPOINT_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

const shouldAvoidRemoteFallbackForRequest = (path: string, options: RequestInit = {}) => {
  const method = String(options.method || "GET").toUpperCase();
  return shouldAvoidRemoteFallback(path) || method !== "GET" || path.startsWith("/api/admin/");
};

const toUrl = (path: string, baseUrl = API_BASE_URL) => `${baseUrl}${path}`;

const readResponseData = async (response: Response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => ({}));
  }

  const text = await response.text().catch(() => "");
  if (!text.trim()) return {};

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const fetchJson = async (
  path: string,
  options: RequestInit = {},
  baseUrl = API_BASE_URL,
) => {
  const response = await fetch(toUrl(path, baseUrl), {
    ...options,
    cache: "no-store",
  });
  const data = await readResponseData(response);
  return { response, data };
};

const getErrorMessage = (data: unknown) => {
  if (typeof data === "string" && data.trim()) {
    const message = data.trim();
    if (/^<!doctype|^<html|^<\w+/i.test(message)) return "Request failed";
    return message;
  }
  if (data && typeof data === "object") {
    const payload = data as {
      message?: unknown;
      error?: unknown;
      errors?: unknown;
      issues?: unknown;
    };
    const message = payload.message;
    if (typeof message === "string" && message.trim()) return message;
    const error = payload.error;
    if (typeof error === "string" && error.trim()) return error;
    const issueList = Array.isArray(payload.issues) ? payload.issues : Array.isArray(payload.errors) ? payload.errors : [];
    const issueMessages = issueList
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "message" in item) {
          const itemMessage = (item as { message?: unknown }).message;
          return typeof itemMessage === "string" ? itemMessage : "";
        }
        return "";
      })
      .filter(Boolean);
    if (issueMessages.length > 0) return issueMessages.slice(0, 3).join(" | ");
  }
  return "Request failed";
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiResponseShape = Record<string, any>;

export const request = async <T = ApiResponseShape>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  let response: Response;
  let data: unknown;
  const canUseRemoteFallback = shouldTryRemoteFallback && !shouldAvoidRemoteFallbackForRequest(path, options);

  try {
    ({ response, data } = await fetchJson(path, options, API_BASE_URL));
  } catch (error) {
    if (!canUseRemoteFallback) throw error;
    ({ response, data } = await fetchJson(path, options, REMOTE_FALLBACK_BASE_URL));
  }

  if (!response.ok && canUseRemoteFallback && response.status >= 500) {
    ({ response, data } = await fetchJson(path, options, REMOTE_FALLBACK_BASE_URL));
  }

  if (!response.ok) {
    const message = getErrorMessage(data);
    if (shouldAvoidRemoteFallback(path) && response.status >= 500) {
      throw new Error(
        `Local backend auth service failed (${response.status}${response.statusText ? ` ${response.statusText}` : ""}). Please restart or fix the backend login/OTP service.`,
      );
    }
    throw new Error(message === "Request failed" && response.statusText ? response.statusText : message);
  }

  return data as T;
};

export const withAuth = (token: string, init: RequestInit = {}) => ({
  ...init,
  headers: {
    "Content-Type": "application/json",
    ...(init.headers || {}),
    Authorization: `Bearer ${token}`,
  },
});
