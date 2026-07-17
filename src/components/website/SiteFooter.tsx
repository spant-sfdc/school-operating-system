import { Camera, Play, Share2 } from "lucide-react";
import Link from "next/link";

import { NAV_LINKS } from "@/components/website/nav-links";

const SOCIAL_LINKS = [
  { label: "Facebook", icon: Share2 },
  { label: "Instagram", icon: Camera },
  { label: "YouTube", icon: Play },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border bg-surface border-t">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <span className="text-foreground text-lg font-semibold tracking-tight">
              Pant Public School
            </span>
            <p className="text-muted-foreground mt-3 max-w-xs text-sm leading-relaxed">
              Vidyadhar Nagar, Jaipur, Rajasthan
            </p>
            <div className="mt-5 flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  role="link"
                  aria-label={`${label} — coming soon`}
                  aria-disabled="true"
                  className="text-muted-foreground border-border flex size-9 cursor-not-allowed items-center justify-center rounded-full border opacity-60"
                >
                  <Icon className="size-4" aria-hidden />
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-foreground text-sm font-semibold">Quick Links</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground duration-fast text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-foreground text-sm font-semibold">Contact</h3>
            <ul className="text-muted-foreground mt-4 flex flex-col gap-3 text-sm leading-relaxed">
              <li>Vidyadhar Nagar, Jaipur, Rajasthan</li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-foreground duration-fast transition-colors"
                >
                  Contact the school office
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-foreground text-sm font-semibold">Admissions</h3>
            <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
              Considering Pant Public School for your child? Start with a simple enquiry.
            </p>
            <Link href="/admissions" className="text-primary mt-3 inline-block text-sm font-medium">
              Apply for admission →
            </Link>
          </div>
        </div>

        <div className="border-border mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-muted-foreground text-sm">
            © {year} Pant Public School. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm">Crafted with care for Pant Public School</p>
        </div>
      </div>
    </footer>
  );
}
