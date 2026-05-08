import { Building2 } from "lucide-react";
import type { ReactNode, SyntheticEvent } from "react";

type CollegeLogoBadgeProps = {
  src?: string;
  alt: string;
  mode?: "logo" | "cover";
  className?: string;
  imageClassName?: string;
  fallback?: ReactNode;
  onError?: (event: SyntheticEvent<HTMLImageElement, Event>) => void;
};

export function CollegeLogoBadge({
  src,
  alt,
  mode = "logo",
  className = "",
  imageClassName = "",
  fallback,
  onError,
}: CollegeLogoBadgeProps) {
  const sharedShellClassName =
    "relative overflow-hidden border border-[rgba(15,76,129,0.14)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,247,237,0.96)_42%,rgba(236,245,255,0.98))] shadow-[0_10px_22px_rgba(22,50,79,0.1)]";

  if (!src) {
    return (
      <div className={`${sharedShellClassName} ${className}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),rgba(255,255,255,0)_58%)]" />
        <div className="relative z-10 flex h-full w-full items-center justify-center text-[color:var(--brand-primary)]">
          {fallback ?? <Building2 className="size-5" />}
        </div>
      </div>
    );
  }

  return (
    <div className={`${sharedShellClassName} ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.98),rgba(255,255,255,0)_58%)]" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onError={onError}
        className={`relative z-10 h-full w-full ${
          mode === "cover"
            ? "object-cover"
            : "object-contain p-1.5 drop-shadow-[0_1px_2px_rgba(15,76,129,0.28)]"
        } ${imageClassName}`}
      />
    </div>
  );
}
