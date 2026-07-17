import { Text } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

import type { ProseProps } from "./Prose.types";

export function Prose({ paragraphs, className }: ProseProps) {
  return (
    <div className={cn("mt-6 space-y-4", className)}>
      {paragraphs.map((paragraph) => (
        <Text key={paragraph} variant="body" className="text-muted-foreground">
          {paragraph}
        </Text>
      ))}
    </div>
  );
}
