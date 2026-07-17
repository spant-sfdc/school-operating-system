import { Calendar, Camera, Drama, GraduationCap, Landmark, Medal, Music, Star } from "lucide-react";

import type { BadgeItem } from "@/components/website/sections/BadgeGroup";
import type { FeatureGridItem } from "@/components/website/sections/FeatureGrid";

import {
  SCHOOL_LIFE_ACHIEVEMENTS_CONTENT,
  SCHOOL_LIFE_CELEBRATIONS_CONTENT,
  SCHOOL_LIFE_CULTURAL_CONTENT,
  SCHOOL_LIFE_EVENTS_CONTENT,
  SCHOOL_LIFE_GALLERY_CONTENT,
  SCHOOL_LIFE_SPORTS_CONTENT,
} from "./content";

const EVENT_ICONS = [Calendar, Landmark, GraduationCap];

export const SCHOOL_LIFE_EVENT_ITEMS: FeatureGridItem[] = SCHOOL_LIFE_EVENTS_CONTENT.items.map(
  (item, index) => ({ icon: EVENT_ICONS[index], ...item }),
);

export const SCHOOL_LIFE_SPORTS_BADGES: BadgeItem[] = SCHOOL_LIFE_SPORTS_CONTENT.badges.map(
  (badge) => ({ ...badge, variant: "neutral" }),
);

const CULTURAL_ICONS = [Music, Star, Drama];

export const SCHOOL_LIFE_CULTURAL_ITEMS: FeatureGridItem[] = SCHOOL_LIFE_CULTURAL_CONTENT.items.map(
  (item, index) => ({ icon: CULTURAL_ICONS[index], ...item }),
);

export const SCHOOL_LIFE_CELEBRATION_BADGES: BadgeItem[] =
  SCHOOL_LIFE_CELEBRATIONS_CONTENT.badges.map((badge) => ({ ...badge, variant: "primary" }));

export const SCHOOL_LIFE_ACHIEVEMENT_ITEMS: FeatureGridItem[] =
  SCHOOL_LIFE_ACHIEVEMENTS_CONTENT.items.map((item) => ({ icon: Medal, ...item }));

export const SCHOOL_LIFE_GALLERY_ITEMS: FeatureGridItem[] = SCHOOL_LIFE_GALLERY_CONTENT.items.map(
  (item) => ({ icon: Camera, ...item }),
);
