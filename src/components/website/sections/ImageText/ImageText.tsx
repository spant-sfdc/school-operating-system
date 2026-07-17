import Link from "next/link";

import { Caption, Heading, Text } from "@/components/ui/typography";
import { ContentContainer } from "@/components/website/sections/ContentContainer";
import { ResponsiveImage } from "@/components/website/sections/ResponsiveImage";
import { cn } from "@/lib/utils";

import type { ImageTextProps } from "./ImageText.types";

export function ImageText({
  eyebrow,
  title,
  description,
  image,
  imagePosition = "left",
  cta,
  variant = "default",
  className,
}: ImageTextProps) {
  return (
    <ContentContainer width="lg" className={className}>
      <div
        className={cn(
          "grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16",
          variant === "compact" && "gap-8 lg:gap-10",
        )}
      >
        <div className={cn(imagePosition === "right" && "lg:order-2")}>
          <ResponsiveImage
            src={image.src}
            alt={image.alt}
            aspect={image.aspect ?? "square"}
            className={cn(variant === "boxed" && "shadow-elevated")}
          />
        </div>

        <div className={cn(imagePosition === "right" && "lg:order-1")}>
          {eyebrow ? <Caption>{eyebrow}</Caption> : null}
          <Heading level={2} className={eyebrow ? "mt-3" : undefined}>
            {title}
          </Heading>
          <Text variant="body" className="text-muted-foreground mt-4">
            {description}
          </Text>
          {cta ? (
            <Link href={cta.href} className="text-primary mt-6 inline-block text-sm font-medium">
              {cta.label} →
            </Link>
          ) : null}
        </div>
      </div>
    </ContentContainer>
  );
}
