import { ArrowUp as ArrowIcon, Tent as CampingIcon, Clock as ClockIcon, Footprints as HikeIcon, Map as MapIcon, User as UserIcon } from "lucide-svelte";
import { SITE_TYPE_LABELS, TRAIL_TYPE_LABELS } from "$lib/db/schemas/enums";
import type { ComponentType } from "svelte";

export interface HeroStat {
  label: string;
  value: string;
  icon: ComponentType;
}

export interface HeroBadge {
  text: string;
  variant: "success" | "warning" | "error" | "info" | "neutral" | "primary";
}

/**
 * Build hero badges for a hike
 */
export function buildHikeBadges(hike: { difficulty?: string | null }): HeroBadge[] {
  const badges: HeroBadge[] = [];

  if (hike.difficulty) {
    badges.push({
      text: hike.difficulty.charAt(0).toUpperCase() + hike.difficulty.slice(1).replace("_", " "),
      variant:
        hike.difficulty === "easy"
          ? "success"
          : hike.difficulty === "moderate"
            ? "warning"
            : "error",
    });
  }

  return badges;
}

/**
 * Build hero stats for a hike
 */
export function buildHikeStats(hike: {
  distance?: string | null;
  duration?: string | null;
  elevation?: string | null;
  trailType?: string | null;
}): HeroStat[] {
  const stats: HeroStat[] = [];

  if (hike.distance) {
    stats.push({ label: "Distance", value: hike.distance, icon: HikeIcon });
  }

  if (hike.duration) {
    stats.push({ label: "Duration", value: hike.duration, icon: ClockIcon });
  }

  if (hike.elevation) {
    stats.push({
      label: "Elevation Gain",
      value: hike.elevation,
      icon: ArrowIcon,
    });
  }

  if (hike.trailType) {
    stats.push({
      label: "Trail Type",
      value: TRAIL_TYPE_LABELS[hike.trailType] || hike.trailType,
      icon: MapIcon,
    });
  }

  return stats;
}

/**
 * Build hero badges for a camping site
 */
export function buildCampingBadges(campingSite: { siteType?: string | null }): HeroBadge[] {
  const badges: HeroBadge[] = [];

  if (campingSite.siteType) {
    badges.push({
      text: SITE_TYPE_LABELS[campingSite.siteType] ?? campingSite.siteType,
      variant: "info",
    });
  }

  return badges;
}

/**
 * Build hero stats for a camping site
 */
export function buildCampingStats(campingSite: {
  siteType?: string | null;
  capacity?: number | null;
  location?: string | null;
}): HeroStat[] {
  const stats: HeroStat[] = [];

  if (campingSite.siteType) {
    stats.push({
      label: "Site Type",
      value: SITE_TYPE_LABELS[campingSite.siteType] ?? campingSite.siteType,
      icon: CampingIcon,
    });
  }

  if (campingSite.capacity) {
    stats.push({
      label: "Capacity",
      value: `${campingSite.capacity} people`,
      icon: UserIcon,
    });
  }

  if (campingSite.location) {
    stats.push({
      label: "Location",
      value: campingSite.location,
      icon: MapIcon,
    });
  }

  return stats;
}
