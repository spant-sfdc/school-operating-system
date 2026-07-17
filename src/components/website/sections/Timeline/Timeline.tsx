import { AnimatedSection } from "@/components/website/sections/AnimatedSection";
import { cn } from "@/lib/utils";

import type { TimelineProps } from "./Timeline.types";

export function Timeline({ items, className }: TimelineProps) {
  return (
    <ol className={cn("border-border relative border-l pl-8", className)}>
      {items.map((item, index) => (
        <AnimatedSection key={`${item.date}-${item.title}`} as="li" delay={index * 0.08}>
          <div className="relative pb-10 last:pb-0">
            <span
              className="bg-primary border-background absolute top-1.5 -left-[calc(2rem+5px)] size-2.5 rounded-full border-2"
              aria-hidden
            />
            <span className="text-primary text-sm font-semibold">{item.date}</span>
            <h3 className="text-foreground mt-1 text-base font-semibold">{item.title}</h3>
            {item.description ? (
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                {item.description}
              </p>
            ) : null}
          </div>
        </AnimatedSection>
      ))}
    </ol>
  );
}
