import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const members = pgTable("members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  memberId: varchar("member_id").notNull().unique(),
  designation: varchar("designation").notNull(),
  joiningDate: timestamp("joining_date").notNull(),
  contactNumber: varchar("contact_number").notNull(),
  bloodGroup: varchar("blood_group"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactNumber: varchar("emergency_contact_number"),
  photoUrl: text("photo_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ngoSettings = pgTable("ngo_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationName: text("organization_name").notNull(),
  phoneNumber: varchar("phone_number").notNull(),
  emailAddress: varchar("email_address"),
  address: text("address"),
  website: varchar("website"),
  logoUrl: text("logo_url"),
  signatureUrl: text("signature_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cardTemplates = pgTable("card_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  colorScheme: varchar("color_scheme").notNull(),
  fontStyle: varchar("font_style").notNull(),
  layoutStyle: varchar("layout_style").notNull(),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
  memberId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNgoSettingsSchema = createInsertSchema(ngoSettings)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    organizationName: z.string().min(1, { message: "Organization name is required" }),
    phoneNumber: z.string().min(1, { message: "Phone number is required" }),
  });

export const insertCardTemplateSchema = createInsertSchema(cardTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type NgoSettings = typeof ngoSettings.$inferSelect;
export type InsertNgoSettings = z.infer<typeof insertNgoSettingsSchema>;
export type CardTemplate = typeof cardTemplates.$inferSelect;
export type InsertCardTemplate = z.infer<typeof insertCardTemplateSchema>;
