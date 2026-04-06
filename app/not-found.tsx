import Link from "next/link";

export default function NotFound() {
  return (
    <section className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#eef4fb_0%,#e7eef8_100%)] px-4 text-[color:var(--text-dark)]">
      <div className="absolute inset-0">
        <div className="absolute left-[-5rem] top-12 h-60 w-60 rounded-full bg-[rgba(60,126,182,0.1)] blur-3xl" />
        <div className="absolute right-[-4rem] top-24 h-52 w-52 rounded-full bg-[rgba(255,138,61,0.12)] blur-3xl" />
        <div className="absolute bottom-[-6rem] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[rgba(15,76,129,0.06)] blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-[1.8rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,249,255,0.96))] p-6 text-center shadow-[0_28px_64px_rgba(22,50,79,0.12)] md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-primary)]">
            Error 404
          </p>
          <h1 className="mt-3 text-2xl font-bold md:text-3xl">Page Not Found</h1>
          <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
            The page you are looking for does not exist or may have been moved.
          </p>
          <Link
            href="/"
            className="shine-button mt-6 inline-flex items-center justify-center rounded-full bg-[color:var(--brand-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)]"
          >
            Back Home
          </Link>
        </div>
      </div>
    </section>
  );
}
