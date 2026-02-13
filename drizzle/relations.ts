import { relations } from "drizzle-orm/relations";
import {
  hikes,
  favorites,
  campingSites,
  alterations,
  addresses,
} from "./schema";

export const favoritesRelations = relations(favorites, ({ one }) => ({
  hike: one(hikes, {
    fields: [favorites.hikeId],
    references: [hikes.id],
  }),
  campingSite: one(campingSites, {
    fields: [favorites.campingSiteId],
    references: [campingSites.id],
  }),
}));

export const hikesRelations = relations(hikes, ({ one, many }) => ({
  favorites: many(favorites),
  alterations: many(alterations),
  address: one(addresses, {
    fields: [hikes.addressId],
    references: [addresses.id],
  }),
}));

export const campingSitesRelations = relations(
  campingSites,
  ({ one, many }) => ({
    favorites: many(favorites),
    alterations: many(alterations),
    address: one(addresses, {
      fields: [campingSites.addressId],
      references: [addresses.id],
    }),
  }),
);

export const alterationsRelations = relations(alterations, ({ one }) => ({
  hike: one(hikes, {
    fields: [alterations.hikeId],
    references: [hikes.id],
  }),
  campingSite: one(campingSites, {
    fields: [alterations.campingSiteId],
    references: [campingSites.id],
  }),
}));

export const addressesRelations = relations(addresses, ({ many }) => ({
  campingSites: many(campingSites),
  hikes: many(hikes),
}));
