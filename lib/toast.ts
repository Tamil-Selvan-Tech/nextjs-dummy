"use client";

import { useEffect, useRef } from "react";
import { toast, type ToastOptions } from "react-toastify";

export type ToastStatus = {
  type: "success" | "error" | "info";
  text: string;
} | null;

const emitToast = (status: Exclude<ToastStatus, null>, options?: ToastOptions) => {
  const message = status.text.trim();
  if (!message) return;

  if (status.type === "success") {
    toast.success(message, options);
    return;
  }

  if (status.type === "error") {
    toast.error(message, options);
    return;
  }

  toast.info(message, options);
};

export const showToast = (
  text: string,
  type: "success" | "error" | "info" = "info",
  options?: ToastOptions,
) => {
  emitToast({ type, text }, options);
};

export function useStatusToast(status: ToastStatus, options?: ToastOptions) {
  const previousMessageRef = useRef("");

  useEffect(() => {
    if (!status?.text) return;
    const key = `${status.type}:${status.text}`;
    if (previousMessageRef.current === key) return;
    previousMessageRef.current = key;
    emitToast(status, options);
  }, [options, status]);
}
