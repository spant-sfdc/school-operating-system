import { cn } from "@/lib/utils";

import { CALLOUT_VARIANT_CONFIG } from "./Callout.constants";
import type { CalloutProps } from "./Callout.types";

export function Callout({ variant = "info", title, children, className }: CalloutProps) {
  const { icon: Icon, border, iconColor, background, label } = CALLOUT_VARIANT_CONFIG[variant];

  return (
    <div
      role="note"
      aria-label={title ?? label}
      className={cn("flex gap-3 rounded-lg border-l-4 p-4", border, background, className)}
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", iconColor)} aria-hidden />
      <div className="text-sm leading-relaxed">
        {title ? <p className="text-foreground mb-1 font-semibold">{title}</p> : null}
        <div className="text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}
