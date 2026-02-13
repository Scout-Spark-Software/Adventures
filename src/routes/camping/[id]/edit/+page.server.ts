import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/db";
import { campingSites, addresses } from "$lib/db/schemas";
import { eq } from "drizzle-orm";
import { requireAuth } from "$lib/auth/middleware";

export const load: PageServerLoad = async (event) => {
  const user = requireAuth(event);

  const campingSite = await db.query.campingSites.findFirst({
    where: eq(campingSites.id, event.params.id),
  });

  if (!campingSite) {
    throw error(404, "Camping site not found");
  }

  // Fetch address if addressId exists
  let address = null;
  if (campingSite.addressId) {
    address = await db.query.addresses.findFirst({
      where: eq(addresses.id, campingSite.addressId),
    });
  }

  return {
    campingSite,
    address,
    userRole: user.role,
  };
};

export const actions: Actions = {
  updateField: async (event) => {
    const user = requireAuth(event);
    const formData = await event.request.formData();

    const fieldName = formData.get("fieldName") as string;
    const newValue = formData.get("newValue") as string;
    const reason = formData.get("reason") as string;

    const isAdmin = user.role === "admin";

    // Handle location updates
    if (fieldName === "location") {
      const addressData = formData.get("address") as string;
      const city = formData.get("city") as string;
      const state = formData.get("state") as string;
      const country = formData.get("country") as string;
      const postalCode = formData.get("postal_code") as string;
      const latitudeStr = formData.get("latitude") as string;
      const longitudeStr = formData.get("longitude") as string;

      if (!city || !state) {
        return { success: false, error: "City and state are required" };
      }

      const campingSite = await db.query.campingSites.findFirst({
        where: eq(campingSites.id, event.params.id),
      });

      if (!campingSite) {
        return { success: false, error: "Camping site not found" };
      }

      if (isAdmin) {
        // Admin updates address directly
        const addressId = campingSite.addressId;

        if (addressId) {
          // Update existing address
          await db
            .update(addresses)
            .set({
              address: addressData,
              city,
              state,
              country,
              postalCode,
              latitude: latitudeStr ? parseFloat(latitudeStr) : null,
              longitude: longitudeStr ? parseFloat(longitudeStr) : null,
            })
            .where(eq(addresses.id, addressId));
        } else {
          // Create new address
          const [newAddress] = await db
            .insert(addresses)
            .values({
              address: addressData,
              city,
              state,
              country,
              postalCode,
              latitude: latitudeStr ? parseFloat(latitudeStr) : null,
              longitude: longitudeStr ? parseFloat(longitudeStr) : null,
            })
            .returning();

          // Link to camping site
          await db
            .update(campingSites)
            .set({ addressId: newAddress.id })
            .where(eq(campingSites.id, event.params.id));
        }

        return { success: true, message: "Location updated successfully!" };
      } else {
        // Regular user submits alteration for location
        const locationData = JSON.stringify({
          address: addressData,
          city,
          state,
          country,
          postalCode,
          latitude: latitudeStr ? parseFloat(latitudeStr) : null,
          longitude: longitudeStr ? parseFloat(longitudeStr) : null,
        });

        const oldAddress = campingSite.addressId
          ? await db.query.addresses.findFirst({
              where: eq(addresses.id, campingSite.addressId),
            })
          : null;

        const response = await event.fetch("/api/alterations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campingSiteId: event.params.id,
            fieldName: "location",
            oldValue: oldAddress
              ? JSON.stringify({
                  address: oldAddress.address,
                  city: oldAddress.city,
                  state: oldAddress.state,
                  country: oldAddress.country,
                  postalCode: oldAddress.postalCode,
                  latitude: oldAddress.latitude,
                  longitude: oldAddress.longitude,
                })
              : "",
            newValue: locationData,
            reason,
          }),
        });

        if (!response.ok) {
          return { success: false, error: "Failed to submit alteration" };
        }

        return {
          success: true,
          message: "Location edit suggestion submitted for review!",
        };
      }
    }

    // Handle regular field updates
    if (!fieldName || !newValue) {
      return { success: false, error: "Field name and new value are required" };
    }

    if (isAdmin) {
      // Admin can edit directly
      const response = await event.fetch(
        `/api/camping-sites/${event.params.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            [fieldName]: newValue,
          }),
        },
      );

      if (!response.ok) {
        return { success: false, error: "Failed to update camping site" };
      }

      return { success: true, message: "Camping site updated successfully!" };
    } else {
      // Regular user submits alteration
      const campingSite = await db.query.campingSites.findFirst({
        where: eq(campingSites.id, event.params.id),
      });

      if (!campingSite) {
        return { success: false, error: "Camping site not found" };
      }

      const response = await event.fetch("/api/alterations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campingSiteId: event.params.id,
          fieldName,
          oldValue: String((campingSite as any)[fieldName] || ""),
          newValue,
          reason,
        }),
      });

      if (!response.ok) {
        return { success: false, error: "Failed to submit alteration" };
      }

      return {
        success: true,
        message: "Edit suggestion submitted for review!",
      };
    }
  },
};
