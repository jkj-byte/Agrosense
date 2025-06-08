import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDiseaseAnalysisSchema, insertCropRecommendationSchema } from "@shared/schema";
import multer from "multer";
import sharp from "sharp";
import fs from "fs";
import path from "path";

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
      let treatments: string[] = [];
      let preventionMethods: string[] = [];

      if (plantIdResult.health_assessment && plantIdResult.health_assessment.diseases && plantIdResult.health_assessment.diseases.length > 0) {
        const disease = plantIdResult.health_assessment.diseases[0];
        diseaseName = disease.name || "Unknown Disease";
        confidence = Math.round((disease.probability || 0) * 100);
        description = disease.description || "No description available.";
        
        // Extract treatment suggestions from Plant.ID if available
        if (disease.treatment && disease.treatment.biological) {
          treatments = disease.treatment.biological.slice(0, 5) || [];
        }
        if (disease.treatment && disease.treatment.chemical) {
          treatments = [...treatments, ...disease.treatment.chemical.slice(0, 3)];
        }
        
        // Extract prevention methods from Plant.ID if available
        if (disease.treatment && disease.treatment.prevention) {
          preventionMethods = disease.treatment.prevention.slice(0, 5) || [];
        }
      }

      // If no treatments from Plant.ID, provide basic recommendations
      if (treatments.length === 0) {
        treatments = [
          "Apply appropriate fungicide as recommended by local agricultural extension",
          "Remove affected plant parts carefully to prevent spread",
          "Improve air circulation around plants",
          "Adjust watering practices to reduce humidity",
          "Consult with local agricultural experts for specific treatment"
        ];
      }

      // If no prevention methods from Plant.ID, provide basic recommendations
      if (preventionMethods.length === 0) {
        preventionMethods = [
          "Regular monitoring of plants for early detection",
          "Proper spacing between plants for air circulation",
          "Avoid overhead watering to reduce leaf moisture",
          "Use disease-resistant plant varieties when available",
          "Maintain good garden hygiene and sanitation"
        ];
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

  // Since we're only using Plant.ID API, crop recommendations are not available
  app.post("/api/crop-recommendations", async (req, res) => {
    res.status(501).json({ 
      error: "Crop recommendations feature is not available in this version. This app focuses on plant disease detection using Plant.ID API.",
      details: "Please use the disease detection feature instead."
    });
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
