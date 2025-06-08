import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const diseaseAnalyses = pgTable("disease_analyses", {
  id: serial("id").primaryKey(),
  imagePath: text("image_path").notNull(),
  diseaseName: text("disease_name"),
  confidence: integer("confidence"),
  description: text("description"),
  treatments: json("treatments").$type<string[]>(),
  preventionMethods: json("prevention_methods").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cropRecommendations = pgTable("crop_recommendations", {
  id: serial("id").primaryKey(),
  location: text("location").notNull(),
  farmSize: integer("farm_size").notNull(),
  soilType: text("soil_type").notNull(),
  budget: text("budget").notNull(),
  experience: text("experience").notNull(),
  recommendations: json("recommendations").$type<Array<{
    name: string;
    suitability: number;
    yield: string;
    season: string;
    profit: string;
    description: string;
  }>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDiseaseAnalysisSchema = createInsertSchema(diseaseAnalyses).omit({
  id: true,
  createdAt: true,
});

export const insertCropRecommendationSchema = createInsertSchema(cropRecommendations).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type DiseaseAnalysis = typeof diseaseAnalyses.$inferSelect;
export type InsertDiseaseAnalysis = z.infer<typeof insertDiseaseAnalysisSchema>;
export type CropRecommendation = typeof cropRecommendations.$inferSelect;
export type InsertCropRecommendation = z.infer<typeof insertCropRecommendationSchema>;
