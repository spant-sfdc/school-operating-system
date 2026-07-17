import { Caption, Heading, Text } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

import type { SectionHeaderProps } from "./SectionHeader.types";

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? <Caption>{eyebrow}</Caption> : null}
      <Heading level={2}>{title}</Heading>
      {description ? (
        <Text variant="lead" className={cn(align === "center" && "max-w-2xl")}>
          {description}
        </Text>
      ) : null}
    </div>
  );
}
