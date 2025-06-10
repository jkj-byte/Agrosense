import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDiseaseAnalysisSchema, insertCropRecommendationSchema } from "@shared/schema";
import multer from "multer";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req: any, file: any, cb: any) => {
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
  app.post("/api/detect-disease", upload.single('image'), async (req: any, res) => {
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

      // Call PlantID API for disease detection with fallback keys
      const apiKeys = [
        "c3hFssf4yjkGg1mxieN1oBjvsfpXIrktrJFh7txgnIHtiJMDuk",
        "pofEoMtP9cX9RdqQ5Ac09EYJw0LmaIUqhM2nM88PIMbFQOlfnS",
        "2hcleIYsBxHKI3GP2qy7F1Q2nxGcZiESpos5NjAPHFmh66au2L",
        process.env.PLANTID_API_KEY
      ].filter(key => key && key !== "default_key");
      
      if (apiKeys.length === 0) {
        throw new Error("Plant.ID API key not configured properly");
      }
      
      let plantIdResponse;
      let lastError;
      
      for (const apiKey of apiKeys) {
        if (!apiKey) continue;
        
        try {
          plantIdResponse = await fetch('https://api.plant.id/v3/health_assessment', {
            method: 'POST',
            headers: {
              'Api-Key': apiKey as string,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              images: [`data:image/jpeg;base64,${base64Image}`],
              health: "all",
              symptoms: true,
              classification_level: "species"
            })
          });
          
          if (plantIdResponse.ok) {
            break; // Success, exit the loop
          } else {
            const errorText = await plantIdResponse.text();
            lastError = `API Key ${apiKey.substring(0, 8)}...: ${plantIdResponse.statusText} - ${errorText}`;
            console.warn('Plant.ID API Key failed:', lastError);
          }
        } catch (error: any) {
          lastError = `API Key ${apiKey.substring(0, 8)}...: ${error?.message || 'Unknown error'}`;
          console.warn('Plant.ID API Key error:', lastError);
        }
      }

      if (!plantIdResponse || !plantIdResponse.ok) {
        console.error('All Plant.ID API keys failed. Last error:', lastError);
        throw new Error(`PlantID API error: ${lastError || 'All API keys failed'}`);
      }

      const plantIdResult = await plantIdResponse.json();
      console.log('Plant.ID API Response:', JSON.stringify(plantIdResult, null, 2));
      
      // Extract disease information from PlantID response
      let diseaseName = "Unknown Disease";
      let confidence = 0;
      let description = "Unable to identify the specific disease.";
      let treatments: string[] = [];
      let preventionMethods: string[] = [];

      // Check if Plant.ID returned valid disease detection results
      if (plantIdResult.result) {
        if (plantIdResult.result.is_healthy.binary) {
          diseaseName = "Healthy Plant";
          confidence = Math.round(plantIdResult.result.is_healthy.probability * 100);
          description = "The plant appears to be healthy with no visible diseases detected.";
          treatments = ["Continue current care routine", "Monitor plant regularly", "Maintain proper watering and lighting"];
          preventionMethods = ["Regular inspection", "Proper watering schedule", "Good air circulation", "Appropriate fertilization"];
        } else if (plantIdResult.result.disease && plantIdResult.result.disease.suggestions.length > 0) {
          // Filter out redundant suggestions
          const validSuggestions = plantIdResult.result.disease.suggestions.filter(s => !s.redundant);
          if (validSuggestions.length > 0) {
            const disease = validSuggestions[0];
            diseaseName = disease.name;
            confidence = Math.round(disease.probability * 100);
            description = `Detected ${disease.name} with ${confidence}% confidence. `;
            
            if (plantIdResult.result.symptom && plantIdResult.result.symptom.suggestions.length > 0) {
              description += `Symptoms include: ${plantIdResult.result.symptom.suggestions.map(s => s.name).join(", ")}.`;
            }

            // Add follow-up question if available
            if (plantIdResult.result.disease.question) {
              description += `\n\nDiagnostic Question: ${plantIdResult.result.disease.question.text}`;
            }
          }
        }
      }

      // If no specific treatments from response, provide general recommendations
      if (treatments.length === 0) {
        treatments = [
          "Isolate affected plant to prevent spread",
          "Remove affected parts if possible",
          "Adjust watering practices",
          "Improve air circulation",
          "Consider appropriate treatment based on specific diagnosis"
        ];
      }

      // If no specific prevention methods, provide general ones
      if (preventionMethods.length === 0) {
        preventionMethods = [
          "Regular monitoring for early detection",
          "Maintain proper plant spacing",
          "Ensure good air circulation",
          "Follow proper watering schedule",
          "Keep growing area clean and debris-free"
        ];
      }

      // Save analysis to storage
      const analysisData = {
        imagePath: processedImagePath,
        diseaseName: diseaseName || "Unknown",
        confidence: confidence || 0,
        description: description || "Analysis completed",
        treatments: treatments.length > 0 ? treatments : null,
        preventionMethods: preventionMethods.length > 0 ? preventionMethods : null
      };

      const analysis = await storage.createDiseaseAnalysis(analysisData);

      // Clean up temporary files
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        if (fs.existsSync(processedImagePath)) {
          fs.unlinkSync(processedImagePath);
        }
      } catch (error) {
        console.warn("Failed to cleanup temporary files:", error);
        // Continue anyway since the API call was successful
      }

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

  // NEW: Crop recommendation endpoint with ML integration
  app.post("/api/crop-recommendations", async (req, res) => {
    try {
      const { nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall } = req.body;
      
      // Validate input
      if (typeof nitrogen !== 'number' || typeof phosphorus !== 'number' || 
          typeof potassium !== 'number' || typeof temperature !== 'number' || 
          typeof humidity !== 'number' || typeof ph !== 'number' || 
          typeof rainfall !== 'number') {
        return res.status(400).json({ error: "All parameters must be numbers" });
      }

      const scriptPath = path.join(__dirname, 'ml_predict.py');
      const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
      
      const pythonProcess = spawn(pythonCommand, [
        scriptPath,
        nitrogen.toString(),
        phosphorus.toString(), 
        potassium.toString(),
        temperature.toString(),
        humidity.toString(),
        ph.toString(),
        rainfall.toString()
      ], {
        cwd: __dirname
      });

      let result: any = null;
      let error = '';
      let stdoutData = '';
      let stderrData = '';

      pythonProcess.stdout.on('data', (data: Buffer) => {
        const output = data.toString().trim();
        stdoutData += output;
        try {
          // Only try to parse JSON if the output starts with {
          if (output.startsWith('{')) {
            result = JSON.parse(output);
          }
        } catch (e) {
          console.error('Parse error:', e);
          console.log('Raw output:', output);
        }
      });

      pythonProcess.stderr.on('data', (data: Buffer) => {
        const output = data.toString();
        stderrData += output;
        // Only log actual errors, not INFO messages
        if (!output.includes('INFO:') && !output.includes('UserWarning:')) {
          error += output;
        }
        console.log('Python message:', output);
      });

      await new Promise((resolve, reject) => {
        pythonProcess.on('close', (code: number) => {
          if (code !== 0 || error || !result || !result.success) {
            if (error) {
              reject(new Error(error));
            } else if (!result || !result.success) {
              reject(new Error('ML prediction failed'));
            } else {
              reject(new Error(`Process exited with code ${code}`));
            }
          } else {
            resolve(result);
          }
        });
      });

      // Save recommendation to storage
      const recommendationData = {
        nitrogen,
        phosphorus,
        potassium,
        temperature,
        humidity,
        ph,
        rainfall,
        predictedCrop: result.predicted_crop,
        confidence: result.confidence,
        createdAt: new Date()
      };

      const recommendation = await storage.createCropRecommendation(recommendationData);

      res.json({
        id: recommendation.id,
        predicted_crop: result.predicted_crop,
        confidence: result.confidence,
        top_predictions: result.top_predictions,
        feature_importance: result.feature_importance,
        crop_info: result.crop_info
      });

    } catch (error) {
      console.error('Crop recommendation error:', error);
      res.status(500).json({ 
        error: 'Failed to generate crop recommendation: ' + (error as Error).message 
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