export type QuoteBlockVariant = "default" | "card" | "large";

export interface QuoteBlockProps {
  quote: string;
  author: string;
  role?: string;
  avatar?: {
    src: string;
    alt: string;
  };
  variant?: QuoteBlockVariant;
  className?: string;
}
