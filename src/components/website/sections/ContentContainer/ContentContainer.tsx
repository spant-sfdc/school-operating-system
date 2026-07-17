import { CONTAINER_WIDTH_CLASSES } from "@/components/website/sections/shared/containerWidths";
import { cn } from "@/lib/utils";

import type { ContentContainerProps } from "./ContentContainer.types";

export function ContentContainer({
  children,
  width = "xl",
  as: Tag = "div",
  className,
}: ContentContainerProps) {
  return (
    <Tag className={cn("mx-auto px-6 lg:px-8", CONTAINER_WIDTH_CLASSES[width], className)}>
      {children}
    </Tag>
  );
}
