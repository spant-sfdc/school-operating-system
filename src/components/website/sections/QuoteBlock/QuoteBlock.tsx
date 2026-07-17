import Image from "next/image";

import { cn } from "@/lib/utils";

import type { QuoteBlockProps } from "./QuoteBlock.types";

export function QuoteBlock({
  quote,
  author,
  role,
  avatar,
  variant = "default",
  className,
}: QuoteBlockProps) {
  return (
    <figure
      className={cn(
        variant === "card" && "border-border bg-surface rounded-2xl border p-8",
        className,
      )}
    >
      <blockquote>
        <p
          className={cn(
            "text-foreground leading-relaxed",
            variant === "large" ? "text-2xl font-medium sm:text-3xl" : "text-lg",
          )}
        >
          “{quote}”
        </p>
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        {avatar ? (
          <Image
            src={avatar.src}
            alt={avatar.alt}
            width={48}
            height={48}
            className="size-12 rounded-full object-cover"
          />
        ) : null}
        <div>
          <div className="text-foreground text-sm font-semibold">{author}</div>
          {role ? <div className="text-muted-foreground text-sm">{role}</div> : null}
        </div>
      </figcaption>
    </figure>
  );
}
