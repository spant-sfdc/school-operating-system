export type BadgeVariant = "neutral" | "primary" | "success" | "warning" | "info";

export interface BadgeItem {
  label: string;
  variant?: BadgeVariant;
}

export interface BadgeGroupProps {
  badges: BadgeItem[];
  className?: string;
}
