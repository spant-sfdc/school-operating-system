import {
  Award,
  Compass,
  Eye,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  Shield,
  Target,
  Users,
} from "lucide-react";

import type { FeatureGridItem } from "@/components/website/sections/FeatureGrid";
import type { TimelineItem } from "@/components/website/sections/Timeline";

import {
  ABOUT_MISSION_VISION_CONTENT,
  ABOUT_TIMELINE_CONTENT,
  ABOUT_VALUES_CONTENT,
  ABOUT_WHY_CHOOSE_CONTENT,
} from "./content";

export const ABOUT_MISSION_VISION_ITEMS: FeatureGridItem[] = [
  { icon: Target, ...ABOUT_MISSION_VISION_CONTENT.items[0] },
  { icon: Eye, ...ABOUT_MISSION_VISION_CONTENT.items[1] },
];

const VALUE_ICONS = [Users, HeartHandshake, Shield, Lightbulb];

export const ABOUT_VALUES_ITEMS: FeatureGridItem[] = ABOUT_VALUES_CONTENT.items.map(
  (item, index) => ({ icon: VALUE_ICONS[index], ...item }),
);

const WHY_CHOOSE_ICONS = [GraduationCap, Compass, Award];

export const ABOUT_WHY_CHOOSE_ITEMS: FeatureGridItem[] = ABOUT_WHY_CHOOSE_CONTENT.items.map(
  (item, index) => ({ icon: WHY_CHOOSE_ICONS[index], ...item }),
);

export const ABOUT_TIMELINE_ITEMS: TimelineItem[] = ABOUT_TIMELINE_CONTENT.items;
