import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const entries = pgTable("entries", {
  id: text("id").primaryKey(),
  collectorId: text("collector_id").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  gpsLocation: text("gps_location"),
  // 'precise' = real GPS lock at submission | 'fallback' = approximate coords (no signal)
  gpsAccuracy: text("gps_accuracy"),
  type: text("type").notNull(), // 'inactive' | 'extension'
  factory: text("factory"),
  route: text("route"),
  supplierNo: text("supplier_no"),
  supplierName: text("supplier_name").notNull(),
  nic: text("nic"),
  phoneNumber: text("phone_number"),
  willGive: text("will_give"), // 'ඔව් (Yes)' | 'නැත (No)'
  promiseReason: text("promise_reason"),
  couldNotMeet: boolean("could_not_meet").default(false),
  actionsTaken: text("actions_taken"),
  permWorkerName: text("perm_worker_name"),
  permWorkerGender: text("perm_worker_gender"),
  permWorkerBirthYear: text("perm_worker_birth_year"),
  permWorkerWages: text("perm_worker_wages"),
  tempWorkersCount: text("temp_workers_count"),
  salesVolumeKg: text("sales_volume_kg"),
  salesVolumeDate: text("sales_volume_date"),
  supplierType: text("supplier_type"), // 'නව සැපයුම්කරු (New Supplier)' | 'පැරණි සැපයුම්කරු (Old Supplier)'
  address: text("address"),
  expectedLeafQty: text("expected_leaf_qty"),
  suggestions: text("suggestions"),
  routeProblems: text("route_problems"),
  comments: text("comments"),
  raNoDeforestation: text("ra_no_deforestation"),
  raRiparianBuffer: text("ra_riparian_buffer"),
  raNoWasteBurning: text("ra_no_waste_burning"),
  raRainwaterHarvesting: text("ra_rainwater_harvesting"),
  raSoilErosion: text("ra_soil_erosion"),
  raWildlifeProtection: text("ra_wildlife_protection"),
  customFieldsJson: text("custom_fields_json"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  employeeId: text("employee_id").unique().notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'admin' | 'collector'
  assignedRoute: text("assigned_route"),
  password: text("password").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: text("id").primaryKey(),
  supplierNo: text("supplier_no").unique().notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  nic: text("nic"),
  route: text("route"),
  factory: text("factory"),
  previousReason: text("previous_reason"),
  lastWeightKg: text("last_weight_kg"),
  // 'active' | 'inactive' — inactive suppliers are the office "not supplying" list
  status: text("status").default("active"),
  // Date the garden was pruned (කප්පාදු කැපීම) — drives recovery reminders
  prunedDate: text("pruned_date"),
  // When an admin resolved/inspected a reminder
  resolvedAt: text("resolved_at"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const routes = pgTable("routes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  factory: text("factory"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const statusReasons = pgTable("status_reasons", {
  id: text("id").primaryKey(),
  labelSi: text("label_si").notNull(),
  labelEn: text("label_en").notNull(),
  badgeColor: text("badge_color"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const customQuestions = pgTable("custom_questions", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  targetForm: text("target_form").notNull(), // 'inactive' | 'extension' | 'both'
  inputType: text("input_type").notNull(), // 'text' | 'number' | 'dropdown' | 'boolean'
  options: text("options"), // comma-separated for dropdown
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type Entry = typeof entries.$inferSelect;
export type InsertEntry = typeof entries.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;
export type Route = typeof routes.$inferSelect;
export type InsertRoute = typeof routes.$inferInsert;
export type StatusReason = typeof statusReasons.$inferSelect;
export type InsertStatusReason = typeof statusReasons.$inferInsert;
export type CustomQuestion = typeof customQuestions.$inferSelect;
export type InsertCustomQuestion = typeof customQuestions.$inferInsert;
