import { GraduationCap } from "lucide-react";

type BrandLogoProps = {
  className?: string;
  alt?: string;
  variant?: "full" | "tab";
  textColor?: "dark" | "light";
  iconClassName?: string;
};

export function BrandLogo({
  className = "",
  alt = "College EdwiseR",
  variant = "full",
  textColor = "dark",
  iconClassName = "",
}: BrandLogoProps) {
  const sizeClass = variant === "tab" ? "text-[14px]" : "text-[16px]";
  const iconClass = variant === "tab" ? "size-4" : "size-5";
  const collegeTextColor = textColor === "light" ? "text-white" : "text-slate-900";

  return (
    <div
      role="img"
      aria-label={alt}
      className={`inline-flex items-center gap-1 font-extrabold leading-none tracking-[0.01em] ${sizeClass} ${className}`}
    >
      <GraduationCap className={`${iconClass} text-[#f4ae35] ${iconClassName}`} strokeWidth={2.2} />
      <span>
        <span className={collegeTextColor}>
          College{" "}
        </span>
        <span className="text-[#f4ae35]">
          EdwiseR
        </span>
      </span>
    </div>
  );
}
