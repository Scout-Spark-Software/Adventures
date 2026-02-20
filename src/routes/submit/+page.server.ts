import { redirect, fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { requireAuth } from "$lib/auth/middleware";
import { db } from "$lib/db";
import { addresses } from "$lib/db/schemas";

// Input sanitization helper
function sanitizeString(value: string | null | undefined): string | null {
  if (!value || value.trim() === "") return null;
  return value.trim().slice(0, 1000); // Basic sanitization: trim and limit length
}

export const load: PageServerLoad = async (event) => {
  requireAuth(event);

  // Load types from database
  const [featureTypes, amenityTypes, facilityTypes] = await Promise.all([
    event.fetch("/api/feature-types?active=true").then((r) => r.json()),
    event.fetch("/api/amenity-types?active=true").then((r) => r.json()),
    event.fetch("/api/facility-types?active=true").then((r) => r.json()),
  ]);

  return {
    featureTypes,
    amenityTypes,
    facilityTypes,
  };
};

export const actions: Actions = {
  submitHike: async ({ request, locals, fetch }) => {
    requireAuth({ locals } as any);
    const formData = await request.formData();

    // Validate required fields
    const name = sanitizeString(formData.get("name") as string);
    if (!name) {
      return fail(400, { error: "Name is required" });
    }

    // Create address if address data is provided
    let addressId = null;
    const address = sanitizeString(formData.get("address") as string);
    const city = sanitizeString(formData.get("city") as string);
    const state = sanitizeString(formData.get("state") as string);
    const country = sanitizeString(formData.get("country") as string);
    const postalCode = sanitizeString(formData.get("postal_code") as string);
    const latitudeStr = formData.get("latitude") as string;
    const longitudeStr = formData.get("longitude") as string;

    if (address || city || state || country || postalCode) {
      const [newAddress] = await db
        .insert(addresses)
        .values({
          address,
          city,
          state,
          country,
          postalCode,
          latitude: latitudeStr ? parseFloat(latitudeStr) : null,
          longitude: longitudeStr ? parseFloat(longitudeStr) : null,
        })
        .returning();
      addressId = newAddress.id;
    }

    // Extract new hike fields
    const permitsRequired = sanitizeString(formData.get("permits_required") as string);
    const bestSeason = formData.get("best_season")
      ? JSON.parse(formData.get("best_season") as string)
      : null;
    const waterSources = formData.get("water_sources") === "on";
    const parkingInfo = sanitizeString(formData.get("parking_info") as string);

    const hikeData = {
      name,
      description: sanitizeString(formData.get("description") as string),
      addressId,
      difficulty: sanitizeString(formData.get("difficulty") as string),
      distance: formData.get("distance") ? formData.get("distance") : null,
      distanceUnit: sanitizeString(formData.get("distance_unit") as string) || "miles",
      duration: formData.get("duration") ? formData.get("duration") : null,
      durationUnit: sanitizeString(formData.get("duration_unit") as string) || "hours",
      elevation: formData.get("elevation") ? formData.get("elevation") : null,
      elevationUnit: sanitizeString(formData.get("elevation_unit") as string) || "feet",
      trailType: sanitizeString(formData.get("trail_type") as string),
      features: formData.get("features") ? JSON.parse(formData.get("features") as string) : null,
      permitsRequired,
      bestSeason,
      waterSources,
      parkingInfo,
    };

    const response = await fetch("/api/hikes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hikeData),
    });

    if (!response.ok) {
      return fail(400, { error: "Failed to submit hike" });
    }

    const hike = await response.json();
    throw redirect(302, `/hikes/${hike.id}`);
  },

  submitCampingSite: async ({ request, locals, fetch }) => {
    requireAuth({ locals } as any);
    const formData = await request.formData();

    // Validate required fields
    const name = sanitizeString(formData.get("name") as string);
    if (!name) {
      return fail(400, { error: "Name is required" });
    }

    // Create address if address data is provided
    let addressId = null;
    const address = sanitizeString(formData.get("address") as string);
    const city = sanitizeString(formData.get("city") as string);
    const state = sanitizeString(formData.get("state") as string);
    const country = sanitizeString(formData.get("country") as string);
    const postalCode = sanitizeString(formData.get("postal_code") as string);
    const latitudeStr = formData.get("latitude") as string;
    const longitudeStr = formData.get("longitude") as string;

    if (address || city || state || country || postalCode) {
      const [newAddress] = await db
        .insert(addresses)
        .values({
          address,
          city,
          state,
          country,
          postalCode,
          latitude: latitudeStr ? parseFloat(latitudeStr) : null,
          longitude: longitudeStr ? parseFloat(longitudeStr) : null,
        })
        .returning();
      addressId = newAddress.id;
    }

    // Extract new camping site fields
    const costPerNight = formData.get("cost_per_night")
      ? parseFloat(formData.get("cost_per_night") as string)
      : null;
    const baseFee = formData.get("base_fee")
      ? parseFloat(formData.get("base_fee") as string)
      : null;
    const operatingSeasonStart = sanitizeString(formData.get("operating_season_start") as string);
    const operatingSeasonEnd = sanitizeString(formData.get("operating_season_end") as string);
    const petPolicy = sanitizeString(formData.get("pet_policy") as string);
    const reservationRequired = formData.get("reservation_required") === "on";
    const siteType = sanitizeString(formData.get("site_type") as string);
    const firePolicy = sanitizeString(formData.get("fire_policy") as string);

    // Validate required enums
    if (!petPolicy || !["allowed", "not_allowed", "restricted"].includes(petPolicy)) {
      return fail(400, { error: "Valid pet policy is required" });
    }

    if (!siteType || !["public", "private", "public_private_partnership"].includes(siteType)) {
      return fail(400, { error: "Valid site type is required" });
    }

    if (
      !firePolicy ||
      !["allowed", "not_allowed", "fire_pits_only", "seasonal"].includes(firePolicy)
    ) {
      return fail(400, { error: "Valid fire policy is required" });
    }

    const campingSiteData = {
      name,
      description: sanitizeString(formData.get("description") as string),
      addressId,
      capacity: sanitizeString(formData.get("capacity") as string),
      amenities: formData.get("amenities") ? JSON.parse(formData.get("amenities") as string) : null,
      facilities: formData.get("facilities")
        ? JSON.parse(formData.get("facilities") as string)
        : null,
      reservationInfo: sanitizeString(formData.get("reservation_info") as string),
      costPerNight,
      baseFee,
      operatingSeasonStart,
      operatingSeasonEnd,
      petPolicy,
      reservationRequired,
      siteType,
      firePolicy,
    };

    const response = await fetch("/api/camping-sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(campingSiteData),
    });

    if (!response.ok) {
      return fail(400, { error: "Failed to submit camping site" });
    }

    const campingSite = await response.json();
    throw redirect(302, `/camping/${campingSite.id}`);
  },
};
