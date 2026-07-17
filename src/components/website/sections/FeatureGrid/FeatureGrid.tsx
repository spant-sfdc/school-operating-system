import { AnimatedSection } from "@/components/website/sections/AnimatedSection";
import { cn } from "@/lib/utils";

import { FEATURE_GRID_COLUMN_CLASSES } from "./FeatureGrid.constants";
import type { FeatureGridProps } from "./FeatureGrid.types";

export function FeatureGrid({ items, columns = 3, className }: FeatureGridProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-6", FEATURE_GRID_COLUMN_CLASSES[columns], className)}>
      {items.map(({ icon: Icon, title, description }, index) => (
        <AnimatedSection key={title} delay={index * 0.06}>
          <div className="border-border bg-surface rounded-2xl border p-6">
            <Icon className="text-primary size-6" aria-hidden />
            <h3 className="text-foreground mt-4 text-base font-semibold">{title}</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{description}</p>
          </div>
        </AnimatedSection>
      ))}
    </div>
  );
}
