/** Fields that can be altered via the alterations API, scoped per entity type. */

const HIKE_ALTERABLE_FIELDS = [
  "name",
  "description",
  "councilId",
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

const CAMPING_SITE_ALTERABLE_FIELDS = [
  "name",
  "description",
  "councilId",
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

const BACKPACKING_ALTERABLE_FIELDS = [
  "name",
  "description",
  "councilId",
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
  "numberOfDays",
  "numberOfNights",
  "campingStyle",
  "waterAvailability",
  "waypoints",
] as const;

export function isAllowedAlterationField(
  fieldName: string,
  entityType: "hike" | "campingSite" | "backpacking"
): boolean {
  const fields =
    entityType === "hike"
      ? HIKE_ALTERABLE_FIELDS
      : entityType === "campingSite"
        ? CAMPING_SITE_ALTERABLE_FIELDS
        : BACKPACKING_ALTERABLE_FIELDS;
  return (fields as readonly string[]).includes(fieldName);
}
