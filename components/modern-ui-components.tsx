"use client";

import { forwardRef, ReactNode } from "react";

// Modern styled wrapper components for the bulk upload dashboard
// These provide enterprise SaaS styling while maintaining all existing functionality

export const ModernCard = forwardRef<
  HTMLDivElement,
  { children: ReactNode; className?: string }
>(({ children, className = "" }, ref) => (
  <div
    ref={ref}
    className={`rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${className}`}
  >
    {children}
  </div>
));
ModernCard.displayName = "ModernCard";

export const ModernButton = forwardRef<
  HTMLButtonElement,
  {
    children: ReactNode;
    variant?: "primary" | "secondary" | "outline" | "danger";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
    type?: "button" | "submit" | "reset";
  }
>(({ children, variant = "primary", size = "md", disabled, onClick, className = "", type = "button" }, ref) => {
  const baseClass = "rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2";
  
  const variantClass = {
    primary: "bg-purple-600 text-white hover:bg-purple-700 shadow-[0_4px_12px_rgba(147,51,234,0.3)]",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    outline: "border-2 border-purple-600 text-purple-600 hover:bg-purple-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
  }[variant];

  const sizeClass = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  }[size];

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClass} ${variantClass} ${sizeClass} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
});
ModernButton.displayName = "ModernButton";

export const ModernBadge = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode;
    variant?: "success" | "error" | "warning" | "info" | "neutral";
    className?: string;
  }
>(({ children, variant = "neutral", className = "" }, ref) => {
  const variantClass = {
    success: "bg-green-100 text-green-700",
    error: "bg-red-100 text-red-700",
    warning: "bg-amber-100 text-amber-700",
    info: "bg-blue-100 text-blue-700",
    neutral: "bg-slate-100 text-slate-700",
  }[variant];

  return (
    <div
      ref={ref}
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${variantClass} ${className}`}
    >
      {children}
    </div>
  );
});
ModernBadge.displayName = "ModernBadge";

export const ModernInput = forwardRef<
  HTMLInputElement,
  {
    type?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    disabled?: boolean;
  }
>(({ type = "text", placeholder, value, onChange, className = "", disabled }, ref) => (
  <input
    ref={ref}
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    disabled={disabled}
    className={`rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium transition-all duration-200 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
  />
));
ModernInput.displayName = "ModernInput";

export const ModernSelect = forwardRef<
  HTMLSelectElement,
  {
    children: ReactNode;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    className?: string;
    disabled?: boolean;
  }
>(({ children, value, onChange, className = "", disabled }, ref) => (
  <select
    ref={ref}
    value={value}
    onChange={onChange}
    disabled={disabled}
    className={`rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium transition-all duration-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
  >
    {children}
  </select>
));
ModernSelect.displayName = "ModernSelect";

export const ModernTab = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode;
    isActive: boolean;
    onClick?: () => void;
    count?: number;
    className?: string;
  }
>(({ children, isActive, onClick, count, className = "" }, ref) => (
  <div
    ref={ref}
    onClick={onClick}
    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer ${
      isActive
        ? "bg-purple-600 text-white shadow-[0_4px_12px_rgba(147,51,234,0.3)]"
        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
    } ${className}`}
  >
    <span className="flex items-center gap-2">
      {children}
      {count !== undefined && <span className="ml-1 text-xs opacity-80">({count})</span>}
    </span>
  </div>
));
ModernTab.displayName = "ModernTab";

export const ModernStatCard = forwardRef<
  HTMLDivElement,
  {
    label: string;
    value: string | number;
    variant?: "primary" | "success" | "error" | "warning" | "info";
    icon?: ReactNode;
    className?: string;
  }
>(({ label, value, variant = "primary", icon, className = "" }, ref) => {
  const variantClass = {
    primary: "bg-blue-50 text-blue-600",
    success: "bg-green-50 text-green-600",
    error: "bg-red-50 text-red-600",
    warning: "bg-amber-50 text-amber-600",
    info: "bg-purple-50 text-purple-600",
  }[variant];

  return (
    <div
      ref={ref}
      className={`rounded-xl ${variantClass} p-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium opacity-75">{label}</p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
        {icon && <div className="text-2xl opacity-50">{icon}</div>}
      </div>
    </div>
  );
});
ModernStatCard.displayName = "ModernStatCard";

// Modern layout wrapper for the bulk upload dashboard
export const ModernBulkUploadWrapper = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 px-6 py-6">
    <div className="mx-auto max-w-7xl">
      {children}
    </div>
  </div>
);

// Modern table wrapper
export const ModernTable = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode;
    className?: string;
  }
>(({ children, className = "" }, ref) => (
  <div
    ref={ref}
    className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${className}`}
  >
    {children}
  </div>
));
ModernTable.displayName = "ModernTable";

// Modern modal/dialog wrapper
export const ModernModal = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode;
    isOpen: boolean;
    onClose?: () => void;
    title?: string;
    className?: string;
  }
>(({ children, isOpen, onClose, title, className = "" }, ref) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={ref}
        className={`fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl ${className}`}
      >
        {title && (
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </>
  );
});
ModernModal.displayName = "ModernModal";

// Modern progress indicator
export const ModernProgress = forwardRef<
  HTMLDivElement,
  {
    steps: string[];
    currentStep: number;
    className?: string;
  }
>(({ steps, currentStep, className = "" }, ref) => (
  <div ref={ref} className={`${className}`}>
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div key={step} className="flex items-center flex-1">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold text-sm ${
                isActive
                  ? "bg-purple-600 text-white shadow-[0_4px_12px_rgba(147,51,234,0.3)]"
                  : isCompleted
                  ? "bg-green-600 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {isCompleted ? "✓" : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-1 flex-1 mx-2 ${
                  isCompleted ? "bg-green-600" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
    <div className="mt-4 flex justify-between text-xs font-medium text-slate-600">
      {steps.map((step) => (
        <span key={step} className="flex-1 text-center">
          {step}
        </span>
      ))}
    </div>
  </div>
));
ModernProgress.displayName = "ModernProgress";
