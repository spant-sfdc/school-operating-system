import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Display, Text } from "@/components/ui/typography";
import { ContentContainer } from "@/components/website/sections/ContentContainer";
import { cn } from "@/lib/utils";

import { PAGE_HERO_PADDING_CLASSES } from "./PageHero.constants";
import type { PageHeroProps } from "./PageHero.types";

function CtaLink({
  cta,
  emphasis,
  onImage,
}: {
  cta: { label: string; href: string };
  emphasis: "primary" | "secondary";
  onImage: boolean;
}) {
  return (
    <Link
      href={cta.href}
      className={cn(
        "duration-fast inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90",
        emphasis === "primary" && !onImage && "bg-primary text-primary-foreground shadow-soft",
        emphasis === "primary" && onImage && "shadow-soft bg-white text-black",
        emphasis === "secondary" &&
          !onImage &&
          "text-foreground border-border hover:bg-surface-muted border",
        emphasis === "secondary" &&
          onImage &&
          "border border-white/40 text-white hover:bg-white/10",
      )}
    >
      {cta.label}
    </Link>
  );
}

export function PageHero({
  title,
  subtitle,
  breadcrumbs,
  cta,
  secondaryCta,
  backgroundImage,
  overlay = true,
  variant = "default",
  className,
}: PageHeroProps) {
  const hasImage = variant === "image" && backgroundImage;

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        PAGE_HERO_PADDING_CLASSES[variant],
        hasImage && "text-white",
        className,
      )}
    >
      {hasImage ? (
        <>
          <Image
            src={backgroundImage.src}
            alt={backgroundImage.alt}
            fill
            priority
            className="object-cover"
          />
          {overlay ? <div className="absolute inset-0 bg-black/50" aria-hidden /> : null}
        </>
      ) : null}

      <ContentContainer width="lg" className="relative text-center">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="mb-6 flex justify-center">
            <ol className="flex flex-wrap items-center justify-center gap-1.5 text-sm">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <li key={crumb.label} className="flex items-center gap-1.5">
                    {crumb.href && !isLast ? (
                      <Link
                        href={crumb.href}
                        className={cn(
                          "duration-fast transition-colors hover:underline",
                          hasImage
                            ? "text-white/80 hover:text-white"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span
                        aria-current={isLast ? "page" : undefined}
                        className={hasImage ? "text-white" : "text-foreground"}
                      >
                        {crumb.label}
                      </span>
                    )}
                    {!isLast ? (
                      <ChevronRight
                        className={cn(
                          "size-3.5",
                          hasImage ? "text-white/60" : "text-muted-foreground",
                        )}
                        aria-hidden
                      />
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}

        <Display className={variant === "minimal" ? "text-4xl sm:text-5xl" : undefined}>
          {title}
        </Display>

        {subtitle ? (
          <Text
            variant="lead"
            className={cn("mx-auto mt-6 max-w-2xl", hasImage && "text-white/90")}
          >
            {subtitle}
          </Text>
        ) : null}

        {cta || secondaryCta ? (
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {cta ? <CtaLink cta={cta} emphasis="primary" onImage={Boolean(hasImage)} /> : null}
            {secondaryCta ? (
              <CtaLink cta={secondaryCta} emphasis="secondary" onImage={Boolean(hasImage)} />
            ) : null}
          </div>
        ) : null}
      </ContentContainer>
    </section>
  );
}
