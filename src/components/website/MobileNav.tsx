"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { LanguageSwitch } from "@/components/website/LanguageSwitch";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { MOBILE_NAV_LINKS } from "@/config/navigation";
import { SCHOOL } from "@/config/school";
import { DURATION } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    firstLinkRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="text-foreground focus-visible:ring-ring inline-flex size-9 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none lg:hidden"
      >
        <Menu className="size-5" aria-hidden />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="bg-background fixed inset-0 z-50 flex flex-col lg:hidden"
            initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: shouldReduceMotion ? 1 : 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : DURATION.base }}
          >
            <div className="flex h-16 items-center justify-between px-6">
              <span className="text-foreground font-semibold">{SCHOOL.name}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="text-foreground focus-visible:ring-ring inline-flex size-9 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <nav className="flex flex-1 flex-col justify-between overflow-y-auto px-6 pb-10">
              <ul className="flex flex-col gap-1 pt-4">
                {MOBILE_NAV_LINKS.map((link, index) => (
                  <li key={link.href}>
                    <Link
                      ref={index === 0 ? firstLinkRef : undefined}
                      href={link.href}
                      className={cn(
                        "duration-fast block rounded-xl px-3 py-3 text-lg font-medium transition-colors",
                        pathname === link.href
                          ? "text-primary"
                          : "text-foreground hover:bg-surface-muted",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="border-border flex flex-col gap-4 border-t pt-6">
                <div className="flex items-center justify-between">
                  <LanguageSwitch />
                  <ThemeToggle />
                </div>
                <Link
                  href="/login"
                  className="text-foreground border-border rounded-full border px-4 py-2.5 text-center text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/admissions"
                  className="bg-primary text-primary-foreground shadow-soft rounded-full px-4 py-2.5 text-center text-sm font-medium"
                >
                  Apply for admission
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
