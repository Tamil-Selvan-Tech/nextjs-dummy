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
      className={`inline-flex items-center gap-2 font-[family:var(--font-poppins)] font-extrabold leading-none tracking-normal ${sizeClass} ${className}`}
    >
      <GraduationCap className={`${iconClass} text-[#f4ae35] ${iconClassName}`} strokeWidth={2.2} />
      <span className="inline-flex items-baseline gap-2 whitespace-nowrap">
        <span className={collegeTextColor}>College</span>
        <span className="text-[#f4ae35]">EdwiseR</span>
      </span>
    </div>
  );
}
