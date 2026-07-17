import Image from "next/image";

import { cn } from "@/lib/utils";

import {
  RESPONSIVE_IMAGE_ASPECT_CLASSES,
  RESPONSIVE_IMAGE_DEFAULT_SIZES,
} from "./ResponsiveImage.constants";
import type { ResponsiveImageProps } from "./ResponsiveImage.types";

export function ResponsiveImage({
  src,
  alt,
  aspect = "video",
  priority = false,
  sizes = RESPONSIVE_IMAGE_DEFAULT_SIZES,
  blurDataURL,
  rounded = true,
  className,
}: ResponsiveImageProps) {
  return (
    <div
      className={cn(
        "bg-surface-muted relative overflow-hidden",
        RESPONSIVE_IMAGE_ASPECT_CLASSES[aspect],
        rounded && "rounded-2xl",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        placeholder={blurDataURL ? "blur" : "empty"}
        blurDataURL={blurDataURL}
        className="object-cover"
      />
    </div>
  );
}
