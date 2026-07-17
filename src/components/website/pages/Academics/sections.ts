import {
  Baby,
  Blocks,
  BookOpen,
  GraduationCap,
  HandHelping,
  Lightbulb,
  Music,
  Palette,
  Target,
  Trophy,
  UsersRound,
} from "lucide-react";

import type { BadgeItem } from "@/components/website/sections/BadgeGroup";
import type { FeatureGridItem } from "@/components/website/sections/FeatureGrid";

import {
  ACADEMICS_COCURRICULAR_CONTENT,
  ACADEMICS_METHODOLOGY_CONTENT,
  ACADEMICS_STAGES_CONTENT,
  ACADEMICS_SUBJECTS_CONTENT,
  ACADEMICS_WHY_CONTENT,
} from "./content";

const STAGE_ICONS = [Baby, Blocks, BookOpen, GraduationCap];

export const ACADEMICS_STAGE_ITEMS: FeatureGridItem[] = ACADEMICS_STAGES_CONTENT.stages.map(
  (stage, index) => ({ icon: STAGE_ICONS[index], ...stage }),
);

export const ACADEMICS_SUBJECT_BADGES: BadgeItem[] = ACADEMICS_SUBJECTS_CONTENT.areas.map(
  (area) => ({
    label: area,
    variant: "neutral",
  }),
);

const METHODOLOGY_ICONS = [UsersRound, Lightbulb, HandHelping];

export const ACADEMICS_METHODOLOGY_ITEMS: FeatureGridItem[] =
  ACADEMICS_METHODOLOGY_CONTENT.items.map((item, index) => ({
    icon: METHODOLOGY_ICONS[index],
    ...item,
  }));

const COCURRICULAR_ICONS = [Trophy, Palette, Music, Target];

export const ACADEMICS_COCURRICULAR_ITEMS: FeatureGridItem[] =
  ACADEMICS_COCURRICULAR_CONTENT.items.map((item, index) => ({
    icon: COCURRICULAR_ICONS[index],
    ...item,
  }));

const WHY_ICONS = [Target, GraduationCap, Lightbulb];

export const ACADEMICS_WHY_ITEMS: FeatureGridItem[] = ACADEMICS_WHY_CONTENT.items.map(
  (item, index) => ({ icon: WHY_ICONS[index], ...item }),
);
