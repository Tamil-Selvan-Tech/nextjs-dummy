import Image from "next/image";

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
  const sizeClass = variant === "tab" ? "text-[15px]" : "text-[16px]";
  const iconSizeClass = variant === "tab" ? "h-10 w-10" : "h-11 w-11";
  const textGapClass = variant === "tab" ? "gap-2" : "gap-2.5";
  const collegeTextColor = textColor === "light" ? "text-white" : "text-slate-900";
  const wordmarkClass = variant === "tab" ? "text-[1em]" : "text-[1.02em]";

  return (
    <div
      role="img"
      aria-label={alt}
      className={`inline-flex items-center ${textGapClass} font-[family:var(--font-poppins)] font-extrabold leading-none tracking-normal ${sizeClass} ${className}`}
    >
      <span
        className={`inline-flex ${iconSizeClass} shrink-0 items-center justify-center rounded-[1rem] bg-white/92 shadow-[0_12px_26px_rgba(15,23,42,0.12)] ${iconClassName}`}
      >
        <Image
          src="/Professional-collegeedwiser-logo.png"
          alt=""
          aria-hidden="true"
          width={1024}
          height={1024}
          priority={variant === "full"}
          className="h-[94%] w-[94%] object-contain"
        />
      </span>
      <span className={`inline-flex items-baseline whitespace-nowrap ${textGapClass} ${wordmarkClass}`}>
        <span className={collegeTextColor}>College</span>
        <span className="text-[#f4ae35]">EdwiseR</span>
      </span>
    </div>
  );
}
