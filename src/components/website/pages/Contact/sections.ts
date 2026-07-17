import type { BadgeItem } from "@/components/website/sections/BadgeGroup";
import type { DataTableRow } from "@/components/website/sections/DataTable";

import {
  CONTACT_OFFICE_CONTENT,
  CONTACT_OVERVIEW_CONTENT,
  CONTACT_SUMMARY_CONTENT,
  CONTACT_TIMINGS_CONTENT,
} from "./content";

export const CONTACT_OVERVIEW_BADGES: BadgeItem[] = CONTACT_OVERVIEW_CONTENT.badges;

export const CONTACT_OFFICE_ROWS: DataTableRow[] = CONTACT_OFFICE_CONTENT.rows;

export const CONTACT_TIMINGS_ROWS: DataTableRow[] = CONTACT_TIMINGS_CONTENT.rows;

export const CONTACT_SUMMARY_BADGES: BadgeItem[] = CONTACT_SUMMARY_CONTENT.badges;
