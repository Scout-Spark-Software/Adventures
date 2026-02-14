import {
    boolean,
    doublePrecision,
    foreignKey,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    unique,
    uuid,
} from "drizzle-orm/pg-core";

export const entityType = pgEnum("entity_type", [
  "hike",
  "camping_site",
  "alteration",
]);
export const fileEntityType = pgEnum("file_entity_type", [
  "hike",
  "camping_site",
]);
export const fileType = pgEnum("file_type", ["image", "document"]);
export const role = pgEnum("role", ["admin", "moderator", "user"]);
export const status = pgEnum("status", ["pending", "approved", "rejected"]);

export const favorites = pgTable(
  "favorites",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    hikeId: uuid("hike_id"),
    campingSiteId: uuid("camping_site_id"),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.hikeId],
      foreignColumns: [hikes.id],
      name: "favorites_hike_id_hikes_id_fk",
    }),
    foreignKey({
      columns: [table.campingSiteId],
      foreignColumns: [campingSites.id],
      name: "favorites_camping_site_id_camping_sites_id_fk",
    }),
  ],
);

export const files = pgTable("files", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  entityType: fileEntityType("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  fileType: fileType("file_type").notNull(),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  uploadedBy: uuid("uploaded_by").notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

export const alterations = pgTable(
  "alterations",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    hikeId: uuid("hike_id"),
    campingSiteId: uuid("camping_site_id"),
    fieldName: text("field_name").notNull(),
    oldValue: text("old_value"),
    newValue: text("new_value").notNull(),
    reason: text(),
    status: status().default("pending").notNull(),
    submittedBy: uuid("submitted_by").notNull(),
    reviewedBy: uuid("reviewed_by"),
    reviewedAt: timestamp("reviewed_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.hikeId],
      foreignColumns: [hikes.id],
      name: "alterations_hike_id_hikes_id_fk",
    }),
    foreignKey({
      columns: [table.campingSiteId],
      foreignColumns: [campingSites.id],
      name: "alterations_camping_site_id_camping_sites_id_fk",
    }),
  ],
);

export const campingSites = pgTable(
  "camping_sites",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    description: text(),
    location: text().notNull(),
    capacity: text(),
    amenities: jsonb(),
    facilities: jsonb(),
    reservationInfo: text("reservation_info"),
    status: status().default("pending").notNull(),
    featured: boolean().default(false).notNull(),
    createdBy: uuid("created_by").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    addressId: uuid("address_id"),
  },
  (table) => [
    foreignKey({
      columns: [table.addressId],
      foreignColumns: [addresses.id],
      name: "camping_sites_address_id_addresses_id_fk",
    }),
  ],
);

export const moderationQueue = pgTable("moderation_queue", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  entityType: entityType("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  status: status().default("pending").notNull(),
  reviewedBy: uuid("reviewed_by"),
  reviewedAt: timestamp("reviewed_at", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

export const userRoles = pgTable(
  "user_roles",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    role: role().default("user").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [unique("user_roles_user_id_unique").on(table.userId)],
);

export const hikes = pgTable(
  "hikes",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    description: text(),
    location: text().notNull(),
    difficulty: text(),
    distance: text(),
    duration: text(),
    elevation: text(),
    trailType: text("trail_type"),
    features: jsonb(),
    status: status().default("pending").notNull(),
    featured: boolean().default(false).notNull(),
    createdBy: uuid("created_by").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    addressId: uuid("address_id"),
  },
  (table) => [
    foreignKey({
      columns: [table.addressId],
      foreignColumns: [addresses.id],
      name: "hikes_address_id_addresses_id_fk",
    }),
  ],
);

export const addresses = pgTable("addresses", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  address: text(),
  city: text(),
  state: text(),
  country: text(),
  postalCode: text("postal_code"),
  latitude: doublePrecision(),
  longitude: doublePrecision(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});
