export type ResponsiveImageAspect = "square" | "video" | "portrait" | "wide";

export interface ResponsiveImageProps {
  src: string;
  alt: string;
  aspect?: ResponsiveImageAspect;
  priority?: boolean;
  sizes?: string;
  blurDataURL?: string;
  rounded?: boolean;
  className?: string;
}
