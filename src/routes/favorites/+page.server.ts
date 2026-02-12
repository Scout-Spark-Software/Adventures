import type { PageServerLoad } from "./$types";
import { requireAuth } from "$lib/auth/middleware";
import { db } from "$lib/db";
import { hikes, campingSites, addresses } from "$lib/db/schemas";
import { eq, inArray } from "drizzle-orm";

export const load: PageServerLoad = async ({ locals, fetch }) => {
  const user = requireAuth({ locals } as any);

  const favorites = await fetch("/api/favorites").then((r) => r.json());

  const hikeIds = favorites
    .filter((f: any) => f.hikeId)
    .map((f: any) => f.hikeId);
  const campingSiteIds = favorites
    .filter((f: any) => f.campingSiteId)
    .map((f: any) => f.campingSiteId);

  const [hikeResults, campingSiteResults] = await Promise.all([
    hikeIds.length > 0
      ? db
          .select({
            id: hikes.id,
            name: hikes.name,
            description: hikes.description,
            addressId: hikes.addressId,
            difficulty: hikes.difficulty,
            distance: hikes.distance,
            distanceUnit: hikes.distanceUnit,
            duration: hikes.duration,
            durationUnit: hikes.durationUnit,
            elevation: hikes.elevation,
            elevationUnit: hikes.elevationUnit,
            trailType: hikes.trailType,
            features: hikes.features,
            dogFriendly: hikes.dogFriendly,
            permitsRequired: hikes.permitsRequired,
            bestSeason: hikes.bestSeason,
            waterSources: hikes.waterSources,
            parkingInfo: hikes.parkingInfo,
            status: hikes.status,
            featured: hikes.featured,
            createdBy: hikes.createdBy,
            createdAt: hikes.createdAt,
            updatedAt: hikes.updatedAt,
            address: {
              id: addresses.id,
              address: addresses.address,
              city: addresses.city,
              state: addresses.state,
              country: addresses.country,
              postalCode: addresses.postalCode,
              latitude: addresses.latitude,
              longitude: addresses.longitude,
            },
          })
          .from(hikes)
          .leftJoin(addresses, eq(hikes.addressId, addresses.id))
          .where(inArray(hikes.id, hikeIds))
      : Promise.resolve([]),
    campingSiteIds.length > 0
      ? db
          .select({
            id: campingSites.id,
            name: campingSites.name,
            description: campingSites.description,
            addressId: campingSites.addressId,
            capacity: campingSites.capacity,
            amenities: campingSites.amenities,
            facilities: campingSites.facilities,
            reservationInfo: campingSites.reservationInfo,
            costPerNight: campingSites.costPerNight,
            baseFee: campingSites.baseFee,
            operatingSeasonStart: campingSites.operatingSeasonStart,
            operatingSeasonEnd: campingSites.operatingSeasonEnd,
            petPolicy: campingSites.petPolicy,
            reservationRequired: campingSites.reservationRequired,
            siteType: campingSites.siteType,
            firePolicy: campingSites.firePolicy,
            status: campingSites.status,
            featured: campingSites.featured,
            createdBy: campingSites.createdBy,
            createdAt: campingSites.createdAt,
            updatedAt: campingSites.updatedAt,
            address: {
              id: addresses.id,
              address: addresses.address,
              city: addresses.city,
              state: addresses.state,
              country: addresses.country,
              postalCode: addresses.postalCode,
              latitude: addresses.latitude,
              longitude: addresses.longitude,
            },
          })
          .from(campingSites)
          .leftJoin(addresses, eq(campingSites.addressId, addresses.id))
          .where(inArray(campingSites.id, campingSiteIds))
      : Promise.resolve([]),
  ]);

  return {
    favorites,
    hikes: hikeResults,
    campingSites: campingSiteResults,
  };
};
