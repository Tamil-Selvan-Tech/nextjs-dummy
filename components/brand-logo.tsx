import { GraduationCap } from "lucide-react";

type BrandLogoProps = {
  className?: string;
  alt?: string;
  variant?: "full" | "tab";
  textColor?: "dark" | "light";
};

export function BrandLogo({
  className = "",
  alt = "College EdwiseR",
  variant = "full",
  textColor = "dark",
}: BrandLogoProps) {
  const sizeClass = variant === "tab" ? "text-[16px] sm:text-[17px]" : "text-[16px]";
  const iconClass = variant === "tab" ? "size-[1.15rem] sm:size-5" : "size-5";
  const collegeTextColor = textColor === "light" ? "text-white" : "text-slate-900";

  return (
    <div
      role="img"
      aria-label={alt}
      className={`inline-flex items-center gap-1 whitespace-nowrap font-extrabold leading-none tracking-[0.01em] ${sizeClass} ${className}`}
    >
      <GraduationCap className={`${iconClass} text-[#f4ae35]`} strokeWidth={2.2} />
      <span className="whitespace-nowrap">
        <span className={collegeTextColor}>College</span>
        <span className="text-[#f4ae35]">EdwiseR</span>
      </span>
    </div>
  );
}
