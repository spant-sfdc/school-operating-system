import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface BaseProps {
  children: ReactNode;
  className?: string;
}

export function Display({ children, className }: BaseProps) {
  return (
    <h1
      className={cn(
        "text-5xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl",
        className,
      )}
    >
      {children}
    </h1>
  );
}

interface HeadingProps extends BaseProps {
  level?: 1 | 2 | 3;
  as?: ElementType;
}

const headingStyles: Record<1 | 2 | 3, string> = {
  1: "text-4xl sm:text-5xl leading-[1.1] font-semibold tracking-tight",
  2: "text-2xl sm:text-3xl leading-tight font-semibold tracking-tight",
  3: "text-lg sm:text-xl leading-snug font-semibold",
};

const headingTags: Record<1 | 2 | 3, ElementType> = { 1: "h1", 2: "h2", 3: "h3" };

export function Heading({ children, className, level = 2, as }: HeadingProps) {
  const Tag = as ?? headingTags[level];
  return <Tag className={cn(headingStyles[level], className)}>{children}</Tag>;
}

interface TextProps extends BaseProps {
  variant?: "lead" | "body" | "small" | "muted";
  as?: ElementType;
}

const textStyles: Record<NonNullable<TextProps["variant"]>, string> = {
  lead: "text-lg sm:text-xl leading-relaxed text-muted-foreground",
  body: "text-base leading-relaxed",
  small: "text-sm leading-relaxed",
  muted: "text-sm leading-relaxed text-muted-foreground",
};

export function Text({ children, className, variant = "body", as = "p" }: TextProps) {
  const Tag = as;
  return <Tag className={cn(textStyles[variant], className)}>{children}</Tag>;
}

export function Caption({ children, className }: BaseProps) {
  return (
    <span
      className={cn("text-muted-foreground text-xs font-medium tracking-wide uppercase", className)}
    >
      {children}
    </span>
  );
}

export function Code({ children, className }: BaseProps) {
  return (
    <code className={cn("bg-surface-muted rounded-md px-1.5 py-0.5 font-mono text-sm", className)}>
      {children}
    </code>
  );
}
