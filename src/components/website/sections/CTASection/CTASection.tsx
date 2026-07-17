import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Heading, Text } from "@/components/ui/typography";
import { ContentContainer } from "@/components/website/sections/ContentContainer";
import { cn } from "@/lib/utils";

import type { CTASectionProps } from "./CTASection.types";

function CtaButton({ cta }: { cta: { label: string; href: string; variant?: string } }) {
  const isPrimary = cta.variant !== "secondary";
  return (
    <Link
      href={cta.href}
      className={cn(
        "duration-fast inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90",
        isPrimary
          ? "bg-primary text-primary-foreground shadow-soft"
          : "text-foreground border-border hover:bg-surface-muted border",
      )}
    >
      {cta.label}
      {isPrimary ? <ArrowRight className="size-4" aria-hidden /> : null}
    </Link>
  );
}

export function CTASection({
  title,
  description,
  primaryCta,
  secondaryCta,
  layout = "centered",
  className,
}: CTASectionProps) {
  return (
    <div className={cn("bg-surface-muted rounded-3xl py-14", className)}>
      <ContentContainer width="md">
        <div
          className={cn(
            "flex flex-col gap-6",
            layout === "centered"
              ? "items-center text-center"
              : "lg:flex-row lg:items-center lg:justify-between lg:text-left",
          )}
        >
          <div className={cn(layout === "centered" && "max-w-xl")}>
            <Heading level={2}>{title}</Heading>
            {description ? (
              <Text variant="body" className="text-muted-foreground mt-3">
                {description}
              </Text>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <CtaButton cta={{ ...primaryCta, variant: "primary" }} />
            {secondaryCta ? <CtaButton cta={{ ...secondaryCta, variant: "secondary" }} /> : null}
          </div>
        </div>
      </ContentContainer>
    </div>
  );
}
