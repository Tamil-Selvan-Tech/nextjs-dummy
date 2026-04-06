type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        "relative overflow-hidden rounded-[1rem]",
        "bg-[linear-gradient(180deg,rgba(15,76,129,0.08),rgba(15,76,129,0.05))]",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite]",
        "before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.75),transparent)]",
        className,
      ].join(" ")}
    />
  );
}
