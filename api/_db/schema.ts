import { integer, pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const linkTable = pgTable("links", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  fullLink: varchar("full_link", { length: 2048 }).notNull(),
  shortId: varchar("short_id", { length: 6 }).notNull().unique(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull()
});

export const deviceTypeEnum = pgEnum("device_types", ["desktop", "mobile", "tablet", "bot"]);

export const accessLogTable = pgTable("access_logs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  linkShortId: varchar("link_short_id", { length: 8 })
    .notNull()
    .references(() => linkTable.shortId, { onDelete: "cascade", onUpdate: "cascade" }),
  accessedAt: timestamp("accessed_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  userAgent: varchar("user_agent", { length: 512 }).notNull(),
  device_type: deviceTypeEnum().notNull(),
  ipAddress: varchar("ip_address", { length: 45 }).notNull()
});
