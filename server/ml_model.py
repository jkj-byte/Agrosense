import sys
import json
import os
import logging
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import joblib

class CropRecommendationModel:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_names = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.model_path = os.path.join(self.base_dir, 'crop_model.pkl')
        self.scaler_path = os.path.join(self.base_dir, 'scaler.pkl')
        self.data_path = os.path.join(self.base_dir, 'Crop_recommendation.csv')
        
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        
        self.crop_info = {
            'rice': {
                'description': 'Rice is a staple food crop that requires warm temperatures and abundant water.',
                'growing_season': 'Monsoon season (June-October)',
                'soil_requirements': 'Clay or loamy soil with good water retention',
                'climate': 'Tropical and subtropical regions'
            },
            'maize': {
                'description': 'Maize (corn) is a versatile cereal crop grown worldwide.',
                'growing_season': 'Spring to summer (March-September)',
                'soil_requirements': 'Well-drained, fertile soil with good organic matter',
                'climate': 'Temperate to tropical regions'
            },
            'chickpea': {
                'description': 'Chickpea is a protein-rich legume crop.',
                'growing_season': 'Winter season (October-March)',
                'soil_requirements': 'Well-drained, neutral to slightly alkaline soil',
                'climate': 'Cool, dry climate'
            },
            'kidneybeans': {
                'description': 'Kidney beans are nutritious legumes rich in protein and fiber.',
                'growing_season': 'Spring to summer (April-August)',
                'soil_requirements': 'Well-drained, fertile soil with good organic content',
                'climate': 'Moderate temperature with adequate moisture'
            },
            'pigeonpeas': {
                'description': 'Pigeon pea is a drought-tolerant legume crop.',
                'growing_season': 'Monsoon season (June-December)',
                'soil_requirements': 'Well-drained soil, tolerates poor soils',
                'climate': 'Semi-arid to sub-humid tropics'
            },
            'mothbeans': {
                'description': 'Moth bean is a drought-resistant legume crop.',
                'growing_season': 'Monsoon season (July-October)',
                'soil_requirements': 'Sandy loam soil with good drainage',
                'climate': 'Arid and semi-arid regions'
            },
            'mungbean': {
                'description': 'Mung bean is a short-duration legume crop.',
                'growing_season': 'Spring and monsoon (March-June, July-October)',
                'soil_requirements': 'Well-drained, fertile soil',
                'climate': 'Warm, humid climate'
            },
            'blackgram': {
                'description': 'Black gram is a protein-rich pulse crop.',
                'growing_season': 'Monsoon and winter (June-September, October-February)',
                'soil_requirements': 'Well-drained, fertile soil',
                'climate': 'Tropical and subtropical regions'
            },
            'lentil': {
                'description': 'Lentil is a cool-season legume crop.',
                'growing_season': 'Winter season (October-March)',
                'soil_requirements': 'Well-drained, neutral to slightly alkaline soil',
                'climate': 'Cool, dry climate'
            },
            'pomegranate': {
                'description': 'Pomegranate is a fruit crop with high antioxidant content.',
                'growing_season': 'Year-round in suitable climates',
                'soil_requirements': 'Well-drained, slightly acidic to neutral soil',
                'climate': 'Semi-arid to arid regions'
            },
            'banana': {
                'description': 'Banana is a tropical fruit crop.',
                'growing_season': 'Year-round in tropical regions',
                'soil_requirements': 'Rich, well-drained soil with high organic matter',
                'climate': 'Warm, humid tropical climate'
            },
            'mango': {
                'description': 'Mango is the king of fruits, grown in tropical regions.',
                'growing_season': 'Year-round in tropical regions',
                'soil_requirements': 'Well-drained, deep soil',
                'climate': 'Tropical and subtropical regions'
            },
            'grapes': {
                'description': 'Grapes are used for fresh consumption and wine production.',
                'growing_season': 'Spring to fall (March-October)',
                'soil_requirements': 'Well-drained, slightly acidic to neutral soil',
                'climate': 'Mediterranean or temperate climate'
            },
            'watermelon': {
                'description': 'Watermelon is a refreshing summer fruit crop.',
                'growing_season': 'Summer season (April-August)',
                'soil_requirements': 'Well-drained, sandy loam soil',
                'climate': 'Warm, sunny climate'
            },
            'muskmelon': {
                'description': 'Muskmelon is a sweet, aromatic fruit crop.',
                'growing_season': 'Summer season (April-July)',
                'soil_requirements': 'Well-drained, fertile soil',
                'climate': 'Warm, dry climate'
            },
            'apple': {
                'description': 'Apple is a temperate fruit crop.',
                'growing_season': 'Spring to fall (March-October)',
                'soil_requirements': 'Well-drained, slightly acidic soil',
                'climate': 'Temperate climate with cold winters'
            },
            'orange': {
                'description': 'Orange is a citrus fruit rich in vitamin C.',
                'growing_season': 'Year-round in suitable climates',
                'soil_requirements': 'Well-drained, slightly acidic to neutral soil',
                'climate': 'Subtropical to tropical climate'
            },
            'papaya': {
                'description': 'Papaya is a tropical fruit with digestive enzymes.',
                'growing_season': 'Year-round in tropical regions',
                'soil_requirements': 'Well-drained, fertile soil',
                'climate': 'Warm, humid tropical climate'
            },
            'coconut': {
                'description': 'Coconut is a versatile tropical palm crop.',
                'growing_season': 'Year-round in tropical regions',
                'soil_requirements': 'Sandy, well-drained soil',
                'climate': 'Tropical coastal regions'
            },
            'cotton': {
                'description': 'Cotton is a major fiber crop.',
                'growing_season': 'Summer season (April-October)',
                'soil_requirements': 'Well-drained, fertile soil',
                'climate': 'Warm climate with adequate moisture'
            },
            'jute': {
                'description': 'Jute is a natural fiber crop.',
                'growing_season': 'Monsoon season (April-August)',
                'soil_requirements': 'Alluvial soil with good water retention',
                'climate': 'Warm, humid climate'
            },
            'coffee': {
                'description': 'Coffee is a major beverage crop.',
                'growing_season': 'Year-round in suitable climates',
                'soil_requirements': 'Well-drained, slightly acidic soil',
                'climate': 'Tropical highland climate'
            }
        }
    
    def load_data(self):
        """Load the crop recommendation dataset"""
        try:
            # Load from the correct file path
            df = pd.read_csv(self.data_path)
            logging.info(f"Dataset loaded successfully with shape: {df.shape}")
            return df
        except FileNotFoundError:
            logging.error("Dataset file not found")
            raise FileNotFoundError("Crop recommendation dataset not found")
    
    def preprocess_data(self, df):
        """Preprocess the data for training"""
        # Separate features and target
        X = df[self.feature_names]
        y = df['label']
        
        # Check for missing values
        if X.isnull().sum().sum() > 0:
            logging.warning("Missing values found in features, filling with median")
            X = X.fillna(X.median())
        
        return X, y
    
    def train_model(self):
        """Train the crop recommendation model"""
        # Load and preprocess data
        df = self.load_data()
        X, y = self.preprocess_data(df)
        
        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale the features
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train Random Forest model
        self.model = RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            max_depth=20,
            min_samples_split=5,
            min_samples_leaf=2
        )
        
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate the model
        y_pred = self.model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        
        logging.info(f"Model trained with accuracy: {accuracy:.4f}")
        logging.info("Classification Report:")
        logging.info(classification_report(y_test, y_pred))
        
        # Save the model and scaler
        self.save_model()
        
        return accuracy
    
    def save_model(self):
        """Save the trained model and scaler"""
        joblib.dump(self.model, self.model_path)
        joblib.dump(self.scaler, self.scaler_path)
        logging.info("Model and scaler saved successfully")
    
    def load_model(self):
        """Load the trained model and scaler"""
        try:
            logging.info(f"Loading model from {self.model_path}")
            self.model = joblib.load(self.model_path)
            logging.info(f"Loading scaler from {self.scaler_path}")
            self.scaler = joblib.load(self.scaler_path)
            logging.info("Model and scaler loaded successfully")
        except FileNotFoundError as e:
            logging.error(f"Model or scaler file not found: {str(e)}")
            raise FileNotFoundError("Required model files not found. Please ensure crop_model.pkl and scaler.pkl exist.")
        except Exception as e:
            logging.error(f"Error loading model: {str(e)}")
            raise Exception(f"Failed to load model: {str(e)}")
    
    def predict(self, features):
        """Make prediction for given features"""
        if self.model is None or self.scaler is None:
            raise ValueError("Model not loaded or trained")
        
        # Convert to numpy array if needed
        if isinstance(features, dict):
            features = [features[name] for name in self.feature_names]
        
        features = np.array(features).reshape(1, -1)
        
        # Scale the features
        features_scaled = self.scaler.transform(features)
        
        # Make prediction
        prediction = self.model.predict(features_scaled)[0]
        prediction_proba = self.model.predict_proba(features_scaled)[0]
        
        # Get confidence score
        confidence = max(prediction_proba)
        
        # Get top 3 predictions
        top_indices = np.argsort(prediction_proba)[-3:][::-1]
        top_crops = [(self.model.classes_[i], prediction_proba[i]) for i in top_indices]
        
        return {
            'predicted_crop': prediction,
            'confidence': confidence,
            'top_predictions': top_crops,
            'crop_info': self.crop_info.get(prediction, {})
        }
    
    def get_feature_importance(self):
        """Get feature importance from the trained model"""
        if self.model is None:
            raise ValueError("Model not trained")
        
        importance = self.model.feature_importances_
        feature_importance = dict(zip(self.feature_names, importance))
        return sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
