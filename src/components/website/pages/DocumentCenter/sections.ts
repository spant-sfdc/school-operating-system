import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileCheck2,
  FileText,
  Flame,
  Landmark,
  PartyPopper,
  Receipt,
  RotateCcw,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import type { FeatureGridItem } from "@/components/website/sections/FeatureGrid";

import { DOCUMENT_CENTER_CATEGORIES, DOCUMENT_CENTER_OVERVIEW_CONTENT } from "./content";

const OVERVIEW_ICONS = [FileText, CalendarDays, Landmark, ShieldCheck];

export const DOCUMENT_CENTER_OVERVIEW_ITEMS: FeatureGridItem[] =
  DOCUMENT_CENTER_OVERVIEW_CONTENT.categories.map((category, index) => ({
    icon: OVERVIEW_ICONS[index],
    ...category,
  }));

const CATEGORY_DOCUMENT_ICONS: Record<string, FeatureGridItem["icon"][]> = {
  "admission-documents": [FileText, FileCheck2, BookOpen],
  "academic-documents": [CalendarDays, ClipboardList, PartyPopper],
  "mandatory-disclosures": [Landmark, FileCheck2, Flame, Receipt],
  "school-policies": [ShieldCheck, RotateCcw, UserCheck],
};

export interface DocumentCenterCategorySection {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  disclaimer: string | null;
  items: FeatureGridItem[];
}

export const DOCUMENT_CENTER_CATEGORY_SECTIONS: DocumentCenterCategorySection[] =
  DOCUMENT_CENTER_CATEGORIES.map((category) => ({
    id: category.id,
    eyebrow: category.eyebrow,
    title: category.title,
    description: category.description,
    disclaimer: category.disclaimer,
    items: category.documents.map((document, index) => ({
      icon: CATEGORY_DOCUMENT_ICONS[category.id][index],
      ...document,
    })),
  }));
