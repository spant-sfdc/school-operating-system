import { Armchair, Camera, Dumbbell, Monitor, Sparkles, Sun, TreePine, Trophy } from "lucide-react";

import type { FeatureGridItem } from "@/components/website/sections/FeatureGrid";

import {
  CAMPUS_CLASSROOMS_CONTENT,
  CAMPUS_GALLERY_CONTENT,
  CAMPUS_SPORTS_CONTENT,
} from "./content";

const CLASSROOM_ICONS = [Sun, Armchair, Sparkles, Monitor];

export const CAMPUS_CLASSROOM_ITEMS: FeatureGridItem[] = CAMPUS_CLASSROOMS_CONTENT.items.map(
  (item, index) => ({ icon: CLASSROOM_ICONS[index], ...item }),
);

const SPORTS_ICONS = [TreePine, Trophy, Dumbbell];

export const CAMPUS_SPORTS_ITEMS: FeatureGridItem[] = CAMPUS_SPORTS_CONTENT.items.map(
  (item, index) => ({ icon: SPORTS_ICONS[index], ...item }),
);

export const CAMPUS_GALLERY_ITEMS: FeatureGridItem[] = CAMPUS_GALLERY_CONTENT.items.map((item) => ({
  icon: Camera,
  ...item,
}));
