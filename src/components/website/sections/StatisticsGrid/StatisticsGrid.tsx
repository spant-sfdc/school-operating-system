"use client";

import {
  animate,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import {
  STATISTICS_GRID_COLUMN_CLASSES,
  STATISTICS_GRID_COUNT_DURATION_SECONDS,
} from "./StatisticsGrid.constants";
import type { StatisticsGridItem, StatisticsGridProps } from "./StatisticsGrid.types";

function Counter({ value, prefix, suffix }: StatisticsGridItem) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const shouldReduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));
  const [display, setDisplay] = useState(0);

  useMotionValueEvent(rounded, "change", (latest) => setDisplay(latest));

  useEffect(() => {
    if (!inView) return;

    if (shouldReduceMotion) {
      motionValue.set(value);
      return;
    }

    const controls = animate(motionValue, value, {
      duration: STATISTICS_GRID_COUNT_DURATION_SECONDS,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [inView, motionValue, shouldReduceMotion, value]);

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

export function StatisticsGrid({ items, columns = 4, className }: StatisticsGridProps) {
  return (
    <dl
      className={cn("grid gap-8 text-center", STATISTICS_GRID_COLUMN_CLASSES[columns], className)}
    >
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-primary text-4xl font-semibold tracking-tight sm:text-5xl">
            <Counter {...item} />
          </dt>
          <dd className="text-muted-foreground mt-2 text-sm">{item.label}</dd>
        </div>
      ))}
    </dl>
  );
}
