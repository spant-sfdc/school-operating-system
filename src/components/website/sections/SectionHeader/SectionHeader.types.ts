import type { SectionAlignment } from "@/components/website/sections/shared/types";

export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: SectionAlignment;
  className?: string;
}
