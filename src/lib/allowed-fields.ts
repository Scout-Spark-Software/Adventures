/** Fields that can be altered via the alterations API, scoped per entity type. */

export const HIKE_ALTERABLE_FIELDS = [
  "name",
  "description",
  "difficulty",
  "distance",
  "distanceUnit",
  "duration",
  "durationUnit",
  "elevation",
  "elevationUnit",
  "trailType",
  "features",
  "permitsRequired",
  "bestSeason",
  "waterSources",
  "parkingInfo",
  "dogFriendly",
] as const;

export const CAMPING_SITE_ALTERABLE_FIELDS = [
  "name",
  "description",
  "capacity",
  "amenities",
  "facilities",
  "reservationInfo",
  "costPerNight",
  "baseFee",
  "operatingSeasonStart",
  "operatingSeasonEnd",
  "petPolicy",
  "reservationRequired",
  "siteType",
  "firePolicy",
] as const;

export function isAllowedAlterationField(
  fieldName: string,
  entityType: "hike" | "campingSite",
): boolean {
  const fields =
    entityType === "hike"
      ? HIKE_ALTERABLE_FIELDS
      : CAMPING_SITE_ALTERABLE_FIELDS;
  return (fields as readonly string[]).includes(fieldName);
}
