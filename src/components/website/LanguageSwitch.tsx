"use client";

import { Check, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en", label: "English", available: true },
  { code: "hi", label: "हिंदी (Hindi)", available: false },
] as const;

export function LanguageSwitch({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Change language, currently English"
        className="text-muted-foreground hover:bg-surface-muted hover:text-foreground focus-visible:ring-ring duration-fast inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <Globe className="size-4" aria-hidden />
        EN
      </button>

      {open && (
        <div
          role="menu"
          className="bg-surface shadow-elevated border-border absolute right-0 z-50 mt-2 w-48 rounded-xl border p-1.5"
        >
          {LANGUAGES.map((language) => (
            <div
              key={language.code}
              role="menuitem"
              aria-disabled={!language.available}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm",
                language.available ? "text-foreground" : "text-muted-foreground cursor-not-allowed",
              )}
            >
              <span>{language.label}</span>
              {language.available ? (
                <Check className="text-primary size-4" aria-hidden />
              ) : (
                <span className="text-xs">Soon</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
