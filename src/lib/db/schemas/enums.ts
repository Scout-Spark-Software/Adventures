import { pgEnum } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", ["pending", "approved", "rejected"]);
export const VALID_STATUSES = statusEnum.enumValues;
export type Status = (typeof VALID_STATUSES)[number];
export const roleEnum = pgEnum("role", ["admin", "moderator", "user"]);
export const entityTypeEnum = pgEnum("entity_type", ["hike", "camping_site", "alteration"]);
export const fileEntityTypeEnum = pgEnum("file_entity_type", ["hike", "camping_site"]);
export const fileTypeEnum = pgEnum("file_type", ["image", "document"]);
export const difficultyEnum = pgEnum("difficulty", ["easy", "moderate", "hard", "very_hard"]);
export const distanceUnitEnum = pgEnum("distance_unit", ["miles", "kilometers"]);
export const durationUnitEnum = pgEnum("duration_unit", ["minutes", "hours"]);
export const elevationUnitEnum = pgEnum("elevation_unit", ["feet", "meters"]);
export const petPolicyEnum = pgEnum("pet_policy", ["allowed", "not_allowed", "restricted"]);
export const firePolicyEnum = pgEnum("fire_policy", [
  "allowed",
  "not_allowed",
  "fire_pits_only",
  "seasonal",
]);
export const siteTypeEnum = pgEnum("site_type", [
  "public",
  "private",
  "public_private_partnership",
]);
export const SITE_TYPE_LABELS: Record<string, string> = {
  public: "Public",
  private: "Private",
  public_private_partnership: "Public-Private Partnership",
};
export const trailTypeEnum = pgEnum("trail_type", ["loop", "out_and_back", "point_to_point"]);
export const TRAIL_TYPE_LABELS: Record<string, string> = {
  loop: "Loop",
  out_and_back: "Out and Back",
  point_to_point: "Point to Point",
};
