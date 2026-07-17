"use client";

import { useMotionValueEvent, useScroll } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { LanguageSwitch } from "@/components/website/LanguageSwitch";
import { MobileNav } from "@/components/website/MobileNav";
import { NAV_LINKS } from "@/components/website/nav-links";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 8);
  });

  return (
    <header
      className={cn(
        "duration-base fixed inset-x-0 top-0 z-40 border-b transition-colors",
        scrolled
          ? "bg-background/85 border-border shadow-soft backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="text-foreground text-lg font-semibold tracking-tight">
          Pant Public School
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "duration-fast rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-1.5 lg:flex">
          <LanguageSwitch />
          <ThemeToggle />
          <Link
            href="/login"
            className="text-foreground hover:bg-surface-muted duration-fast rounded-full px-3.5 py-2 text-sm font-medium transition-colors"
          >
            Login
          </Link>
          <Link
            href="/admissions"
            className="bg-primary text-primary-foreground shadow-soft duration-fast ml-1 rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
          >
            Apply for admission
          </Link>
        </div>

        <MobileNav />
      </div>
    </header>
  );
}
