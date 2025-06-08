import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDiseaseAnalysisSchema, insertCropRecommendationSchema } from "@shared/schema";
import multer from "multer";
import OpenAI from "openai";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG and PNG files are allowed'));
    }
  }
});

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Plant disease detection endpoint
  app.post("/api/detect-disease", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file uploaded" });
      }

      // Process image with Sharp to ensure compatibility
      const processedImagePath = path.join(uploadsDir, `processed_${req.file.filename}.jpg`);
      await sharp(req.file.path)
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toFile(processedImagePath);

      // Convert image to base64 for APIs
      const imageBuffer = fs.readFileSync(processedImagePath);
      const base64Image = imageBuffer.toString('base64');

      // Call PlantID API for disease detection
      const plantIdApiKey = process.env.PLANTID_API_KEY || process.env.PLANTID_API_KEY_ENV_VAR || "default_key";
      
      const plantIdResponse = await fetch('https://api.plant.id/v3/health_assessment', {
        method: 'POST',
        headers: {
          'Api-Key': plantIdApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: [`data:image/jpeg;base64,${base64Image}`],
          modifiers: ["crops_fast", "similar_images"],
        })
      });

      if (!plantIdResponse.ok) {
        throw new Error(`PlantID API error: ${plantIdResponse.statusText}`);
      }

      const plantIdResult = await plantIdResponse.json();
      
      // Extract disease information from PlantID response
      let diseaseName = "Unknown Disease";
      let confidence = 0;
      let description = "Unable to identify the specific disease.";

      if (plantIdResult.health_assessment && plantIdResult.health_assessment.diseases && plantIdResult.health_assessment.diseases.length > 0) {
        const disease = plantIdResult.health_assessment.diseases[0];
        diseaseName = disease.name || "Unknown Disease";
        confidence = Math.round((disease.probability || 0) * 100);
        description = disease.description || "No description available.";
      }

      // Use OpenAI to generate treatment and prevention recommendations
      const openAiPrompt = `As an agricultural expert, provide treatment recommendations and prevention strategies for the plant disease: ${diseaseName}. 
      
      Description: ${description}
      
      Please provide:
      1. Treatment recommendations (specific steps to treat the disease)
      2. Prevention methods (how to prevent this disease in the future)
      
      Format your response as JSON with this exact structure:
      {
        "treatments": ["treatment1", "treatment2", "treatment3"],
        "preventionMethods": ["prevention1", "prevention2", "prevention3"]
      }`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const openAiResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert agricultural advisor. Provide practical, actionable advice for plant disease treatment and prevention."
          },
          {
            role: "user",
            content: openAiPrompt
          }
        ],
        response_format: { type: "json_object" },
      });

      let treatments: string[] = [];
      let preventionMethods: string[] = [];

      try {
        const openAiResult = JSON.parse(openAiResponse.choices[0].message.content || "{}");
        treatments = openAiResult.treatments || [];
        preventionMethods = openAiResult.preventionMethods || [];
      } catch (error) {
        console.error("Error parsing OpenAI response:", error);
        treatments = ["Apply appropriate fungicide as recommended by local agricultural extension", "Remove affected plant parts", "Improve air circulation around plants"];
        preventionMethods = ["Regular monitoring of plants", "Proper spacing between plants", "Avoid overhead watering"];
      }

      // Save analysis to storage
      const analysisData = {
        imagePath: processedImagePath,
        diseaseName,
        confidence,
        description,
        treatments,
        preventionMethods
      };

      const analysis = await storage.createDiseaseAnalysis(analysisData);

      // Clean up temporary files
      fs.unlinkSync(req.file.path);

      res.json({
        id: analysis.id,
        diseaseName,
        confidence,
        description,
        treatments,
        preventionMethods
      });

    } catch (error) {
      console.error("Disease detection error:", error);
      res.status(500).json({ 
        error: "Failed to analyze plant disease. Please try again with a clear image of the affected plant.",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Crop recommendations endpoint
  app.post("/api/crop-recommendations", async (req, res) => {
    try {
      const validatedData = insertCropRecommendationSchema.parse(req.body);
      
      // Use OpenAI to generate crop recommendations
      const openAiPrompt = `As an agricultural expert, provide crop recommendations for a farm with the following characteristics:
      
      Location: ${validatedData.location}
      Farm Size: ${validatedData.farmSize} acres
      Soil Type: ${validatedData.soilType}
      Budget: ${validatedData.budget}
      Farmer Experience: ${validatedData.experience}
      
      Please recommend 3-5 suitable crops with the following information for each:
      - Name of the crop
      - Suitability percentage (0-100%)
      - Expected yield per acre
      - Growing season duration
      - Estimated profit per acre
      - Brief description of why this crop is suitable
      
      Format your response as JSON with this exact structure:
      {
        "recommendations": [
          {
            "name": "Crop Name",
            "suitability": 95,
            "yield": "180 bu/acre",
            "season": "90-110 days",
            "profit": "$850/acre",
            "description": "Brief explanation of suitability"
          }
        ]
      }`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const openAiResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert agricultural advisor with knowledge of crops, soil types, climate conditions, and farming economics. Provide practical, location-specific crop recommendations."
          },
          {
            role: "user",
            content: openAiPrompt
          }
        ],
        response_format: { type: "json_object" },
      });

      let recommendations: Array<{
        name: string;
        suitability: number;
        yield: string;
        season: string;
        profit: string;
        description: string;
      }> = [];

      try {
        const openAiResult = JSON.parse(openAiResponse.choices[0].message.content || "{}");
        recommendations = openAiResult.recommendations || [];
      } catch (error) {
        console.error("Error parsing OpenAI response:", error);
        // Fallback recommendations
        recommendations = [
          {
            name: "Corn",
            suitability: 85,
            yield: "150 bu/acre",
            season: "90-120 days",
            profit: "$650/acre",
            description: "Versatile crop suitable for most soil types and climates"
          },
          {
            name: "Soybeans", 
            suitability: 80,
            yield: "50 bu/acre",
            season: "100-130 days",
            profit: "$580/acre",
            description: "Nitrogen-fixing legume that improves soil health"
          }
        ];
      }

      // Save recommendation to storage
      const recommendationData = {
        ...validatedData,
        recommendations
      };

      const savedRecommendation = await storage.createCropRecommendation(recommendationData);

      res.json({
        id: savedRecommendation.id,
        recommendations
      });

    } catch (error) {
      console.error("Crop recommendation error:", error);
      res.status(500).json({ 
        error: "Failed to generate crop recommendations. Please check your input and try again.",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get disease analysis by ID
  app.get("/api/disease-analysis/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const analysis = await storage.getDiseaseAnalysis(id);
      
      if (!analysis) {
        return res.status(404).json({ error: "Disease analysis not found" });
      }

      res.json(analysis);
    } catch (error) {
      console.error("Get disease analysis error:", error);
      res.status(500).json({ error: "Failed to retrieve disease analysis" });
    }
  });

  // Get crop recommendation by ID
  app.get("/api/crop-recommendation/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const recommendation = await storage.getCropRecommendation(id);
      
      if (!recommendation) {
        return res.status(404).json({ error: "Crop recommendation not found" });
      }

      res.json(recommendation);
    } catch (error) {
      console.error("Get crop recommendation error:", error);
      res.status(500).json({ error: "Failed to retrieve crop recommendation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
