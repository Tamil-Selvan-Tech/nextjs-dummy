import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function NotFound() {
  return (
    <main data-app-page="not-found" className="flex min-h-[70vh] items-center justify-center px-4 py-16 text-center">
      <div className="max-w-xl">
        <BrandLogo variant="full" textColor="dark" className="mx-auto h-10" />
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-primary)]">
          Page not found
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[color:var(--text-dark)] sm:text-4xl">
          We could not find that page.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-[color:var(--text-muted)]">
          The page you are looking for may have been moved, removed, or the link may be incorrect.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--brand-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)]"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
