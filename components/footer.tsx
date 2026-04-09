"use client";

import {
  BadgeCheck,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { topCollegeCourseLinks } from "@/lib/site-data";

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M13.5 21v-7h2.3l.4-3h-2.7V9.1c0-.9.3-1.5 1.6-1.5H16V4.9c-.5-.1-1.4-.2-2.4-.2-2.4 0-4 1.5-4 4.2V11H7v3h2.2v7h4.3Z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12 7.3A4.7 4.7 0 1 0 16.7 12 4.7 4.7 0 0 0 12 7.3Zm0 7.7A3 3 0 1 1 15 12 3 3 0 0 1 12 15Zm6-7.9a1.1 1.1 0 1 0 1.1 1.1A1.1 1.1 0 0 0 18 7.1Zm2.9 1.1a5.2 5.2 0 0 0-1.4-3.7A5.2 5.2 0 0 0 15.8 3.1C14.4 3 9.6 3 8.2 3.1A5.2 5.2 0 0 0 4.5 4.5 5.2 5.2 0 0 0 3.1 8.2C3 9.6 3 14.4 3.1 15.8a5.2 5.2 0 0 0 1.4 3.7 5.2 5.2 0 0 0 3.7 1.4c1.4.1 6.2.1 7.6 0a5.2 5.2 0 0 0 3.7-1.4 5.2 5.2 0 0 0 1.4-3.7c.1-1.4.1-6.2 0-7.6ZM19.2 17a3.3 3.3 0 0 1-1.9 1.9c-1.3.5-4.3.4-5.3.4s-4 .1-5.3-.4A3.3 3.3 0 0 1 4.8 17c-.5-1.3-.4-4.3-.4-5.3s-.1-4 .4-5.3A3.3 3.3 0 0 1 6.7 4.8c1.3-.5 4.3-.4 5.3-.4s4-.1 5.3.4a3.3 3.3 0 0 1 1.9 1.9c.5 1.3.4 4.3.4 5.3s.1 4-.4 5.3Z" />
  </svg>
);

export function Footer() {
  const pathname = usePathname();
  const hiddenFooterRoutes = [
    "/search",
    "/search-results",
    "/login",
    "/login-otp",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/set-password",
    "/verify-email",
    "/college-dashboard",
  ];
  const shouldHideFooter =
    hiddenFooterRoutes.includes(pathname) ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/college/");
  const socialLinks = [
    { href: "https://www.facebook.com/collegeEdwiser/", label: "Facebook", icon: FacebookIcon },
    { href: "https://www.collegeedwiser.com", label: "Website", icon: BadgeCheck },
    { href: "mailto:info@collegeedwiser.com", label: "Email", icon: Mail },
    { href: "https://www.instagram.com/collegeedwiser/", label: "Instagram", icon: InstagramIcon },
  ];

  if (shouldHideFooter) {
    return null;
  }

  return (
    <footer className="border-t border-[rgba(30,78,121,0.12)] bg-white text-[color:var(--text-dark)]">
      <div className="page-container-full py-10 md:py-12">
        <div className="rounded-[1.8rem] border border-[rgba(30,78,121,0.12)] bg-white p-5 shadow-[0_18px_44px_rgba(30,78,121,0.12)] md:p-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr_0.9fr] xl:items-start">
          <div className="max-w-sm">
            <BrandLogo variant="tab" textColor="dark" className="h-9" />
            <p className="mt-3 text-sm text-[color:var(--text-muted)]">
              Your gateway to educational excellence and career opportunities.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-[rgba(30,78,121,0.08)] px-3 py-1.5 text-xs font-semibold text-[color:var(--brand-primary)]">
                Student First
              </span>
              <span className="rounded-full bg-[rgba(239,68,68,0.12)] px-3 py-1.5 text-xs font-semibold text-[color:var(--brand-accent-deep)]">
                Trusted Discovery
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-[color:var(--text-dark)]">
              Top Courses
            </h4>
            <ul className="mt-4 space-y-2">
              {topCollegeCourseLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={`/explore?q=${encodeURIComponent(item.query)}`}
                    className="text-sm text-[color:var(--text-muted)] transition hover:text-[color:var(--brand-primary)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-[color:var(--text-dark)]">Top Streams</h4>
            <ul className="mt-4 space-y-2">
              <li><Link href="/explore?q=Engineering" className="text-sm text-[color:var(--text-muted)] transition hover:text-[color:var(--brand-primary)]">Engineering</Link></li>
              <li><Link href="/explore?q=Management" className="text-sm text-[color:var(--text-muted)] transition hover:text-[color:var(--brand-primary)]">Management</Link></li>
              <li><Link href="/explore?q=Medical" className="text-sm text-[color:var(--text-muted)] transition hover:text-[color:var(--brand-primary)]">Medical</Link></li>
              <li><Link href="/explore?q=Law" className="text-sm text-[color:var(--text-muted)] transition hover:text-[color:var(--brand-primary)]">Law</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-[color:var(--text-dark)]">Tools</h4>
            <ul className="mt-4 space-y-2">
              <li><Link href="/find" className="text-sm text-[color:var(--text-muted)] transition hover:text-[color:var(--brand-primary)]">Find Colleges</Link></li>
              <li><Link href="/cutoff" className="text-sm text-[color:var(--text-muted)] transition hover:text-[color:var(--brand-primary)]">Cutoff Lookup</Link></li>
              <li><Link href="/contact" className="text-sm text-[color:var(--text-muted)] transition hover:text-[color:var(--brand-primary)]">Contact Us</Link></li>
              <li><Link href="/services" className="text-sm text-[color:var(--text-muted)] transition hover:text-[color:var(--brand-primary)]">Services</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-[color:var(--text-dark)]">Company</h4>
            <ul className="mt-4 space-y-2">
              <li><Link href="/about-us" className="text-sm text-[color:var(--text-muted)] transition hover:text-[color:var(--brand-primary)]">About Us</Link></li>
              <li><Link href="/advertising" className="text-sm text-[color:var(--text-muted)] transition hover:text-[color:var(--brand-primary)]">Advertising</Link></li>
              <li><Link href="/careers" className="text-sm text-[color:var(--text-muted)] transition hover:text-[color:var(--brand-primary)]">Careers</Link></li>
              <li><Link href="/privacy-policy" className="text-sm text-[color:var(--text-muted)] transition hover:text-[color:var(--brand-primary)]">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

          <div className="mt-8 border-t border-[rgba(30,78,121,0.12)] pt-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-3 text-sm font-bold text-[color:var(--text-dark)]">Get in Touch</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm text-[color:var(--text-muted)]">
                  <MapPin className="size-4 text-[color:var(--brand-primary-soft)]" />
                  <a
                    href="https://maps.app.goo.gl/XxGvX3eegjh5ekmN7"
                    target="_blank"
                    rel="noreferrer"
                    className="transition hover:text-[color:var(--brand-primary)]"
                  >
                    No.23A, Sriram Layout Rd, Saibaba Colony, Coimbatore, Tamil Nadu - 641 011
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-[color:var(--text-muted)]">
                  <Mail className="size-4 text-[color:var(--brand-primary-soft)]" />
                  <a href="mailto:info@collegeedwiser.com" className="transition hover:text-[color:var(--brand-primary)]">
                    info@collegeedwiser.com
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-[color:var(--text-muted)]">
                  <Phone className="size-4 text-[color:var(--brand-primary-soft)]" />
                  <a href="tel:+919080649970" className="transition hover:text-[color:var(--brand-primary)]">
                    9080649970
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-bold text-[color:var(--text-dark)]">Follow Us</h4>
              <div className="flex flex-wrap gap-4">
                {socialLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    title={item.label}
                    className="flex size-9 items-center justify-center rounded-full border border-[rgba(30,78,121,0.12)] bg-white text-[color:var(--text-muted)] transition hover:border-[rgba(239,68,68,0.4)] hover:bg-[rgba(30,78,121,0.04)] hover:text-[color:var(--brand-primary)]"
                  >
                    <Icon className="size-4" />
                  </a>
                );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-[rgba(30,78,121,0.12)] pt-6 text-center text-sm text-[color:var(--text-muted)] md:flex-row md:text-left">
          <p>&copy; 2026 College EdwiseR. All Rights Reserved.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/privacy-policy" className="transition hover:text-[color:var(--brand-primary)]">Privacy Policy</Link>
            <Link href="/terms" className="transition hover:text-[color:var(--brand-primary)]">Terms & Conditions</Link>
            <Link href="/disclaimer" className="transition hover:text-[color:var(--brand-primary)]">Disclaimer</Link>
          </div>
        </div>
        </div>
      </div>
    </footer>
  );
}
