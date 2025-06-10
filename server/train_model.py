#!/usr/bin/env python3
"""
Script to train and save the crop recommendation model
"""
from ml_model import CropRecommendationModel

def main():
    print("Training crop recommendation model...")
    model = CropRecommendationModel()
    accuracy = model.train_model()
    print(f"Model trained successfully with accuracy: {accuracy:.4f}")

if __name__ == "__main__":
    main() 