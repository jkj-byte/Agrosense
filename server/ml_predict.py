#!/usr/bin/env python3
"""
Standalone ML prediction script that can be called from Node.js
Takes command line arguments and returns JSON result
"""
import sys
import json
from ml_model import CropRecommendationModel

def main():
    if len(sys.argv) != 8:
        print(json.dumps({"error": "Invalid number of arguments"}))
        sys.exit(1)
    
    try:
        # Parse command line arguments
        nitrogen = float(sys.argv[1])
        phosphorus = float(sys.argv[2])
        potassium = float(sys.argv[3])
        temperature = float(sys.argv[4])
        humidity = float(sys.argv[5])
        ph = float(sys.argv[6])
        rainfall = float(sys.argv[7])
        
        # Create features dictionary
        features = {
            'N': nitrogen,
            'P': phosphorus,
            'K': potassium,
            'temperature': temperature,
            'humidity': humidity,
            'ph': ph,
            'rainfall': rainfall
        }
        
        # Load model and make prediction
        model = CropRecommendationModel()
        model.load_model()
        result = model.predict(features)
        
        # Convert numpy types to Python native types for JSON serialization
        output = {
            "success": True,
            "predicted_crop": result["predicted_crop"],
            "confidence": float(result["confidence"]),
            "top_predictions": [[crop, float(conf)] for crop, conf in result["top_predictions"]],
            "crop_info": result["crop_info"]
        }
        
        # Add feature importance if available
        try:
            feature_importance = model.get_feature_importance()
            output["feature_importance"] = [[feature, float(importance)] for feature, importance in feature_importance]
        except:
            output["feature_importance"] = []
        
        print(json.dumps(output))
        
    except Exception as e:
        print(json.dumps({"error": str(e), "success": False}))
        sys.exit(1)

if __name__ == "__main__":
    main()