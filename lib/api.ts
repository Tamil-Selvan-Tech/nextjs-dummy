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

const toUrl = (path: string, baseUrl = API_BASE_URL) => `${baseUrl}${path}`;

const fetchJson = async (
  path: string,
  options: RequestInit = {},
  baseUrl = API_BASE_URL,
) => {
  const response = await fetch(toUrl(path, baseUrl), {
    ...options,
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
};

const getErrorMessage = (data: unknown) => {
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
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

  try {
    ({ response, data } = await fetchJson(path, options, API_BASE_URL));
  } catch (error) {
    if (!shouldTryRemoteFallback) throw error;
    ({ response, data } = await fetchJson(path, options, REMOTE_FALLBACK_BASE_URL));
  }

  if (!response.ok && shouldTryRemoteFallback && response.status >= 500) {
    ({ response, data } = await fetchJson(path, options, REMOTE_FALLBACK_BASE_URL));
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(data));
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
