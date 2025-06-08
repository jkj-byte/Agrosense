import { users, diseaseAnalyses, cropRecommendations, type User, type InsertUser, type DiseaseAnalysis, type InsertDiseaseAnalysis, type CropRecommendation, type InsertCropRecommendation } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createDiseaseAnalysis(analysis: InsertDiseaseAnalysis): Promise<DiseaseAnalysis>;
  getDiseaseAnalysis(id: number): Promise<DiseaseAnalysis | undefined>;
  createCropRecommendation(recommendation: InsertCropRecommendation): Promise<CropRecommendation>;
  getCropRecommendation(id: number): Promise<CropRecommendation | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private diseaseAnalyses: Map<number, DiseaseAnalysis>;
  private cropRecommendations: Map<number, CropRecommendation>;
  private currentUserId: number;
  private currentAnalysisId: number;
  private currentRecommendationId: number;

  constructor() {
    this.users = new Map();
    this.diseaseAnalyses = new Map();
    this.cropRecommendations = new Map();
    this.currentUserId = 1;
    this.currentAnalysisId = 1;
    this.currentRecommendationId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createDiseaseAnalysis(insertAnalysis: InsertDiseaseAnalysis): Promise<DiseaseAnalysis> {
    const id = this.currentAnalysisId++;
    const analysis: DiseaseAnalysis = { 
      ...insertAnalysis, 
      id,
      createdAt: new Date()
    };
    this.diseaseAnalyses.set(id, analysis);
    return analysis;
  }

  async getDiseaseAnalysis(id: number): Promise<DiseaseAnalysis | undefined> {
    return this.diseaseAnalyses.get(id);
  }

  async createCropRecommendation(insertRecommendation: InsertCropRecommendation): Promise<CropRecommendation> {
    const id = this.currentRecommendationId++;
    const recommendation: CropRecommendation = { 
      ...insertRecommendation, 
      id,
      createdAt: new Date()
    };
    this.cropRecommendations.set(id, recommendation);
    return recommendation;
  }

  async getCropRecommendation(id: number): Promise<CropRecommendation | undefined> {
    return this.cropRecommendations.get(id);
  }
}

export const storage = new MemStorage();
