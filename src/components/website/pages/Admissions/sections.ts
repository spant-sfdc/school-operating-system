import { Camera, FileCheck, FileText, IdCard, IndianRupee } from "lucide-react";

import type { BadgeItem } from "@/components/website/sections/BadgeGroup";
import type { FeatureGridItem } from "@/components/website/sections/FeatureGrid";
import type { TimelineItem } from "@/components/website/sections/Timeline";

import {
  ADMISSIONS_DOCUMENTS_CONTENT,
  ADMISSIONS_FEES_CONTENT,
  ADMISSIONS_JOURNEY_CONTENT,
  ADMISSIONS_OVERVIEW_CONTENT,
} from "./content";

export const ADMISSIONS_OVERVIEW_BADGES: BadgeItem[] = ADMISSIONS_OVERVIEW_CONTENT.facts;

export const ADMISSIONS_JOURNEY_ITEMS: TimelineItem[] = ADMISSIONS_JOURNEY_CONTENT.steps.map(
  (step) => ({ date: `Step ${step.step}`, title: step.title, description: step.description }),
);

const DOCUMENT_ICONS = [FileText, Camera, FileCheck, IdCard];

export const ADMISSIONS_DOCUMENTS_ITEMS: FeatureGridItem[] = ADMISSIONS_DOCUMENTS_CONTENT.items.map(
  (item, index) => ({ icon: DOCUMENT_ICONS[index], ...item }),
);

export const ADMISSIONS_FEES_ITEMS: FeatureGridItem[] = ADMISSIONS_FEES_CONTENT.groups.map(
  (group) => ({ icon: IndianRupee, ...group }),
);
