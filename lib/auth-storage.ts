export const AUTH_TOKEN_KEY = "collegehub_token";
export const CURRENT_USER_KEY = "collegehub_current_user";
export const PENDING_OTP_KEY = "collegehub_pending_otp_login";

export type SafeAuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
};

export type PendingOtpLogin = {
  email: string;
  role: string;
  accountType: string;
};

const isBrowser = () => typeof window !== "undefined";

export const persistAuth = (token: string, user: SafeAuthUser) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

export const clearAuth = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(CURRENT_USER_KEY);
};

export const readAuthToken = () => {
  if (!isBrowser()) return "";
  return window.localStorage.getItem(AUTH_TOKEN_KEY) || "";
};

export const readCurrentUser = (): SafeAuthUser | null => {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(CURRENT_USER_KEY);
    return raw ? (JSON.parse(raw) as SafeAuthUser) : null;
  } catch {
    return null;
  }
};

export const persistPendingOtpLogin = (payload: PendingOtpLogin | null) => {
  if (!isBrowser()) return;
  if (!payload) {
    window.sessionStorage.removeItem(PENDING_OTP_KEY);
    return;
  }
  window.sessionStorage.setItem(PENDING_OTP_KEY, JSON.stringify(payload));
};

export const readPendingOtpLogin = (): PendingOtpLogin | null => {
  if (!isBrowser()) return null;
  try {
    const raw = window.sessionStorage.getItem(PENDING_OTP_KEY);
    return raw ? (JSON.parse(raw) as PendingOtpLogin) : null;
  } catch {
    return null;
  }
};
