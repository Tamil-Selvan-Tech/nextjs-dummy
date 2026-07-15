"use client";

import { Globe, Mail, MapPin, Phone } from "lucide-react";
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

const topStreamLinks = [
  { label: "Engineering", href: "/explore?stream=Engineering" },
  { label: "Arts & Science", href: "/explore?stream=Arts%20%26%20Science" },
  { label: "Medical", href: "/explore?stream=Medical" },
  { label: "Law", href: "/explore?stream=Law" },
];

const toolsLinks = [
  { label: "Cutoff Lookup", href: "/find" },
  { label: "Contact Us", href: "/contact" },
  { label: "Services", href: "/services" },
];

const companyLinks = [
  { label: "About Us", href: "/about-us" },
  { label: "Advertising", href: "/advertising" },
  { label: "Careers", href: "/careers" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Disclaimer", href: "/disclaimer" },
];

const footerEmail = "infocollege@collegeedwiser.com";
const footerEmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${footerEmail}`;

const socialLinks = [
  { href: "https://www.facebook.com/collegeEdwiser/", label: "Facebook", icon: FacebookIcon },
  { href: "https://www.collegeedwiser.com", label: "Website", icon: Globe },
  { href: footerEmailHref, label: "Email", icon: Mail },
  { href: "https://www.instagram.com/collegeedwiser/", label: "Instagram", icon: InstagramIcon },
];

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
  "/college/enquiries",
  "/college/manage",
  "/college/requests",
];



const sectionHeadingClass =
  "type-label-bold uppercase tracking-[0.12em] text-white/[0.9]";

const linkClass =
  "type-body-small text-white/[0.72] transition hover:text-white";

export function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  const shouldHideFooter =
    hiddenFooterRoutes.includes(pathname) ||
    pathname.startsWith("/admin");

  if (shouldHideFooter) {
    return null;
  }

  return (
    <footer className="site-footer overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_26%),radial-gradient(circle_at_top_right,rgba(244,174,53,0.12),transparent_22%),linear-gradient(180deg,#132a60_0%,#102554_100%)] text-white">
      <div className="page-container-full py-8 sm:py-9 lg:py-10 xl:py-12">
        <div className="mx-auto max-w-[96rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.035))] shadow-[0_30px_80px_rgba(4,15,39,0.34)] backdrop-blur-sm 2xl:max-w-[110rem]">
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 border-b border-white/10 px-5 py-8 sm:grid-cols-2 sm:px-7 md:px-8 lg:grid-cols-[minmax(17rem,1.22fr)_repeat(4,minmax(0,0.88fr))] lg:items-start xl:gap-x-10 xl:px-10 2xl:grid-cols-[minmax(21rem,1.38fr)_repeat(4,minmax(0,1fr))] 2xl:gap-x-12 2xl:px-12">
            <div className="col-span-2 max-w-[17rem] sm:max-w-[19rem] lg:col-span-1 2xl:max-w-[22rem]">
              <BrandLogo variant="tab" textColor="light" className="h-9" />
              <p className="type-body-small mt-5 max-w-sm text-white/[0.72]">
                Your gateway to educational excellence and career opportunities.
              </p>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <span className="rounded-full border border-white/10 bg-white/[0.08] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#d8e7ff]">
                  Student First
                </span>
                <span className="rounded-full border border-[#f4ae35]/20 bg-[#f4ae35]/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#ffd37d]">
                  Trusted Discovery
                </span>
              </div>
            </div>

            <div className="min-w-0">
              <h4 className={sectionHeadingClass}>Top Courses</h4>
              <ul className="mt-4 space-y-0.5">
                {topCollegeCourseLinks.map((item) => (
                  <li key={item.label}>
                    <Link href={`/explore?q=${encodeURIComponent(item.query)}`} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0">
              <h4 className={sectionHeadingClass}>Top Streams</h4>
              <ul className="mt-4 space-y-0.5">
                {topStreamLinks.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0">
              <h4 className={sectionHeadingClass}>Tools</h4>
              <ul className="mt-4 space-y-0.5">
                {toolsLinks.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0">
              <h4 className={sectionHeadingClass}>Company</h4>
              <ul className="mt-4 space-y-0.5">
                {companyLinks.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-8 border-b border-white/10 px-5 py-7 sm:px-7 md:px-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(14rem,0.92fr)] lg:items-start xl:px-10 2xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)] 2xl:px-12">
            <div className="min-w-0">
              <h4 className="type-label-bold text-white">Get in Touch</h4>
              <div className="mt-4 space-y-3">
                <div className="type-body-small flex items-start gap-3 text-white/[0.68]">
                  <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] text-[#9cc3ff]">
                    <MapPin className="size-4" />
                  </span>
                  <a
                    href="https://maps.app.goo.gl/XxGvX3eegjh5ekmN7"
                    target="_blank"
                    rel="noreferrer"
                    className="max-w-[42rem] transition hover:text-white"
                  >
                    No.23A, Sriram Layout Rd, Saibaba Colony, Coimbatore, Tamil Nadu - 641 011
                  </a>
                </div>

                <div className="type-body-small flex items-center gap-3 text-white/[0.68]">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] text-[#9cc3ff]">
                    <Mail className="size-4" />
                  </span>
                  <a href={footerEmailHref} className="transition hover:text-white">
                    {footerEmail}
                  </a>
                </div>

                <div className="type-body-small flex items-center gap-3 text-white/[0.68]">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] text-[#9cc3ff]">
                    <Phone className="size-4" />
                  </span>
                  <a href="tel:+919080649970" className="transition hover:text-white">
                    9080649970
                  </a>
                </div>
              </div>
            </div>

            <div className="min-w-0 lg:justify-self-start">
              <h4 className="type-label-bold text-white">Follow Us</h4>
              <div className="mt-4 flex flex-wrap gap-3">
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
                      className="inline-flex size-10 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.08] text-white/[0.78] transition hover:-translate-y-0.5 hover:border-[#f4ae35]/40 hover:bg-white/[0.12] hover:text-white"
                    >
                      <Icon className="size-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 px-5 py-5 text-center sm:px-7 md:px-8 lg:flex-row lg:items-end lg:justify-between lg:text-left xl:px-10 2xl:px-12">
            <p className="type-caption text-white/[0.58]">
              &copy; {currentYear} College EdwiseR. All Rights Reserved.
            </p>

            <div className="flex flex-col items-center gap-2 lg:items-end">
              <div className="type-caption flex flex-wrap justify-center gap-x-5 gap-y-2 text-white/[0.64] lg:justify-end">
                {legalLinks.map((item) => (
                  <Link key={item.label} href={item.href} className="transition hover:text-white">
                    {item.label}
                  </Link>
                ))}
              </div>
              <p className="type-caption text-white/[0.58]">
                Design and Development by{" "}
                <a
                  href="https://www.javixtechnologies.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-white/[0.82] transition hover:text-white"
                >
                  Javix Technologies
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
