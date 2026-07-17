import { BookOpen, MapPin, Sparkles, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { SCHOOL } from "@/config/school";

interface StatItem {
  icon: LucideIcon;
  label: string;
  description: string;
}

const STATS: StatItem[] = [
  {
    icon: Users,
    label: "Attentive teaching",
    description: "Small enough that every student is known",
  },
  {
    icon: BookOpen,
    label: "Considered curriculum",
    description: "Academics built around depth, not just pace",
  },
  {
    icon: Sparkles,
    label: "Beyond the classroom",
    description: "Sports, arts, and everyday character",
  },
  {
    icon: MapPin,
    label: SCHOOL.locationShort,
    description: "Rooted in the community we serve",
  },
];

export function StatStrip() {
  return (
    <dl className="border-border divide-border grid grid-cols-1 divide-y rounded-2xl border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
      {STATS.map(({ icon: Icon, label, description }) => (
        <div key={label} className="flex flex-col gap-2 p-6">
          <Icon className="text-primary size-5" aria-hidden />
          <dt className="text-foreground text-sm font-semibold">{label}</dt>
          <dd className="text-muted-foreground text-sm leading-relaxed">{description}</dd>
        </div>
      ))}
    </dl>
  );
}
