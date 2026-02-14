import { requireAuth } from "$lib/auth/middleware";
import { db } from "$lib/db";
import { addresses, campingSites, favorites, hikes, ratingAggregates } from "$lib/db/schemas";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  requireAuth({ locals } as { locals: { user: { id: string } } });

  const userId = locals.user!.id;

  // Single optimized query: Get all favorites with full hike and camping site data in one go
  const [favoriteHikes, favoriteCampingSites] = await Promise.all([
    // Get favorited hikes with all related data
    db
      .select({
        favoriteId: favorites.id,
        favoriteCreatedAt: favorites.createdAt,
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
        ratingAggregate: {
          averageRating: ratingAggregates.averageRating,
          totalRatings: ratingAggregates.totalRatings,
          totalReviews: ratingAggregates.totalReviews,
        },
      })
      .from(favorites)
      .innerJoin(hikes, eq(favorites.hikeId, hikes.id))
      .leftJoin(addresses, eq(hikes.addressId, addresses.id))
      .leftJoin(ratingAggregates, eq(hikes.id, ratingAggregates.hikeId))
      .where(
        and(eq(favorites.userId, userId), isNotNull(favorites.hikeId), eq(hikes.status, "approved"))
      )
      .orderBy(desc(favorites.createdAt)),

    // Get favorited camping sites with all related data
    db
      .select({
        favoriteId: favorites.id,
        favoriteCreatedAt: favorites.createdAt,
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
        ratingAggregate: {
          averageRating: ratingAggregates.averageRating,
          totalRatings: ratingAggregates.totalRatings,
          totalReviews: ratingAggregates.totalReviews,
        },
      })
      .from(favorites)
      .innerJoin(campingSites, eq(favorites.campingSiteId, campingSites.id))
      .leftJoin(addresses, eq(campingSites.addressId, addresses.id))
      .leftJoin(ratingAggregates, eq(campingSites.id, ratingAggregates.campingSiteId))
      .where(
        and(
          eq(favorites.userId, userId),
          isNotNull(favorites.campingSiteId),
          eq(campingSites.status, "approved")
        )
      )
      .orderBy(desc(favorites.createdAt)),
  ]);

  // Normalize results to handle nullable joins
  const normalizeResult = (item: any) => {
    const { favoriteId, favoriteCreatedAt, ...rest } = item;
    return {
      ...rest,
      address: item.address?.id != null ? item.address : null,
      ratingAggregate: item.ratingAggregate?.averageRating != null ? item.ratingAggregate : null,
    };
  };

  // Build favorites array for compatibility with existing components
  const favoritesArray = [
    ...favoriteHikes.map((h) => ({
      id: h.favoriteId,
      userId,
      hikeId: h.id,
      campingSiteId: null,
      createdAt: h.favoriteCreatedAt,
    })),
    ...favoriteCampingSites.map((c) => ({
      id: c.favoriteId,
      userId,
      hikeId: null,
      campingSiteId: c.id,
      createdAt: c.favoriteCreatedAt,
    })),
  ];

  return {
    favorites: favoritesArray,
    hikes: favoriteHikes.map(normalizeResult),
    campingSites: favoriteCampingSites.map(normalizeResult),
  };
};
