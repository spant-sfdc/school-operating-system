"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

import { cn } from "@/lib/utils";

import type { FAQAccordionProps } from "./FAQAccordion.types";

export function FAQAccordion({ items, allowMultiple = false, className }: FAQAccordionProps) {
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set());
  const baseId = useId();

  function toggle(index: number) {
    setOpenIndexes((previous) => {
      const next = allowMultiple ? new Set(previous) : new Set<number>();
      if (previous.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <div className={cn("divide-border border-border divide-y border-t border-b", className)}>
      {items.map((item, index) => {
        const isOpen = openIndexes.has(index);
        const buttonId = `${baseId}-button-${index}`;
        const panelId = `${baseId}-panel-${index}`;

        return (
          <div key={item.question}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                className="focus-visible:ring-ring flex w-full items-center justify-between gap-4 py-5 text-left focus-visible:ring-2 focus-visible:outline-none"
              >
                <span className="text-foreground font-medium">{item.question}</span>
                <ChevronDown
                  className={cn(
                    "text-muted-foreground duration-base size-4 shrink-0 transition-transform motion-reduce:transition-none",
                    isOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn(
                "duration-base grid transition-[grid-template-rows] motion-reduce:transition-none",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <p className="text-muted-foreground pb-5 text-sm leading-relaxed">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
