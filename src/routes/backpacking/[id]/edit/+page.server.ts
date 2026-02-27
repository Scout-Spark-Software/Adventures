import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/db";
import { backpacking, addresses } from "$lib/db/schemas";
import { eq } from "drizzle-orm";
import { requireAuth } from "$lib/auth/middleware";

export const load: PageServerLoad = async (event) => {
  const user = requireAuth(event);

  const entry = await db.query.backpacking.findFirst({
    where: eq(backpacking.id, event.params.id),
  });

  if (!entry) {
    throw error(404, "Backpacking route not found");
  }

  let address = null;
  if (entry.addressId) {
    address = await db.query.addresses.findFirst({
      where: eq(addresses.id, entry.addressId),
    });
  }

  const councilsRes = await event.fetch("/api/councils");
  const councils = councilsRes.ok ? await councilsRes.json() : [];

  return {
    backpacking: entry,
    address,
    councils,
    userRole: user.role,
  };
};

export const actions: Actions = {
  delete: async (event) => {
    const user = requireAuth(event);

    if (user.role !== "admin") {
      return { success: false, error: "Not authorized" };
    }

    const response = await event.fetch(`/api/backpacking/${event.params.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      return { success: false, error: "Failed to delete backpacking route" };
    }

    throw redirect(303, "/backpacking");
  },

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

      const entry = await db.query.backpacking.findFirst({
        where: eq(backpacking.id, event.params.id),
      });

      if (!entry) {
        return { success: false, error: "Backpacking route not found" };
      }

      if (isAdmin) {
        const addressId = entry.addressId;

        if (addressId) {
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

          await db
            .update(backpacking)
            .set({ addressId: newAddress.id })
            .where(eq(backpacking.id, event.params.id));
        }

        return { success: true, message: "Location updated successfully!" };
      } else {
        const locationData = JSON.stringify({
          address: addressData,
          city,
          state,
          country,
          postalCode,
          latitude: latitudeStr ? parseFloat(latitudeStr) : null,
          longitude: longitudeStr ? parseFloat(longitudeStr) : null,
        });

        const oldAddress = entry.addressId
          ? await db.query.addresses.findFirst({
              where: eq(addresses.id, entry.addressId),
            })
          : null;

        const response = await event.fetch("/api/alterations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            backpackingId: event.params.id,
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
    if (!fieldName || (fieldName !== "waypoints" && !newValue)) {
      return { success: false, error: "Field name and new value are required" };
    }

    if (isAdmin) {
      // waypoints arrives as a JSON string — parse it back to an array
      const fieldValue =
        fieldName === "waypoints"
          ? (() => {
              try {
                return JSON.parse(newValue || "[]");
              } catch {
                return [];
              }
            })()
          : newValue;

      const response = await event.fetch(`/api/backpacking/${event.params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [fieldName]: fieldValue,
        }),
      });

      if (!response.ok) {
        return { success: false, error: "Failed to update backpacking route" };
      }

      return { success: true, message: "Backpacking route updated successfully!" };
    } else {
      const entry = await db.query.backpacking.findFirst({
        where: eq(backpacking.id, event.params.id),
      });

      if (!entry) {
        return { success: false, error: "Backpacking route not found" };
      }

      const response = await event.fetch("/api/alterations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          backpackingId: event.params.id,
          fieldName,
          oldValue: String((entry as any)[fieldName] || ""),
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
