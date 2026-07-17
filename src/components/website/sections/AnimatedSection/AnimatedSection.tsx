"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

import { getAnimatedSectionVariants } from "./AnimatedSection.constants";
import type { AnimatedSectionProps } from "./AnimatedSection.types";

export function AnimatedSection({
  children,
  variant = "fadeUp",
  delay = 0,
  as = "div",
  className,
}: AnimatedSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const variants = getAnimatedSectionVariants(variant, Boolean(shouldReduceMotion));
  const MotionTag = as === "section" ? motion.section : as === "li" ? motion.li : motion.div;

  return (
    <MotionTag
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={variants}
      transition={{ delay: shouldReduceMotion ? 0 : delay }}
    >
      {children}
    </MotionTag>
  );
}
