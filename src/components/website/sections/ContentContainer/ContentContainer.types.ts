import type { ElementType, ReactNode } from "react";

import type { ContainerWidth } from "@/components/website/sections/shared/types";

export interface ContentContainerProps {
  children: ReactNode;
  width?: ContainerWidth;
  as?: ElementType;
  className?: string;
}
