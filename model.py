#!/usr/bin/env python3
"""
ML Model Handler for Cattle Breed Classification
"""

import tensorflow as tf
import numpy as np
import json
import os
from datetime import datetime

# Indian cattle and buffalo breeds (74 total)
INDIAN_BREEDS = {
    'Gir': 0, 'Sahiwal': 1, 'Red_Sindhi': 2, 'Tharparkar': 3, 'Rathi': 4,
    'Kankrej': 5, 'Ongole': 6, 'Krishna_Valley': 7, 'Deoni': 8, 'Khillari': 9,
    'Kangayam': 10, 'Bargur': 11, 'Pulikulam': 12, 'Umblachery': 13, 'Alambadi': 14,
    'Hallikar': 15, 'Amritmahal': 16, 'Mysore': 17, 'Malnad_Gidda': 18, 'Vechur': 19,
    'Kasaragod': 20, 'Punganur': 21, 'Bachaur': 22, 'Gangatiri': 23, 'Hariana': 24,
    'Nimari': 25, 'Malvi': 26, 'Nagori': 27, 'Mewati': 28, 'Khariar': 29,
    'Kenwariya': 30, 'Dangi': 31, 'Gaolao': 32, 'Lohani': 33, 'Kherigarh': 34,
    'Ponwar': 35, 'Siri': 36, 'Bhagnari': 37, 'Cholistani': 38, 'Dhanni': 39,
    'Murrah': 40, 'Nili_Ravi': 41, 'Kundi': 42, 'Surti': 43, 'Jafarabadi': 44,
    'Bhadawari': 45, 'Tarai': 46, 'Marathwadi': 47, 'Pandharpuri': 48,
    'Kalahandi': 49, 'Sambalpuri': 50, 'Chilika': 51, 'Mehsana': 52, 'Nagpuri': 53,
    'Toda': 54, 'Jaffarabadi': 55, 'Mithun': 56, 'Yak': 57, 'Tibetan': 58,
    'Siri_Cattle': 59, 'Bhutia': 60, 'Arunachali': 61, 'Sikkim_Local': 62,
    'Hill_Cattle': 63, 'Ladakhi': 64, 'Valley_Cattle': 65, 'Takin': 66,
    'Gayal': 67, 'Gaur': 68, 'Wild_Buffalo': 69, 'Red_Kandhari': 70,
    'Rojhan': 71, 'Dajal': 72, 'Forest_Buffalo': 73
}

class CattleBreedClassifier:
    """Main classifier for Indian cattle and buffalo breeds"""
    
    def __init__(self, model_path=None):
        self.model = None
        self.breed_names = list(INDIAN_BREEDS.keys())
        self.num_classes = len(INDIAN_BREEDS)
        self.input_size = (224, 224)
        
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
    
    def load_model(self, model_path):
        """Load the trained model"""
        try:
            self.model = tf.keras.models.load_model(model_path)
            print(f"Model loaded successfully from {model_path}")
            return True
        except Exception as e:
            print(f"Failed to load model: {str(e)}")
            return False
    
    def predict(self, image):
        """Predict breed from preprocessed image"""
        try:
            if self.model is None:
                return self._dummy_prediction()
            
            # Ensure image is in correct format
            if len(image.shape) == 3:
                image = np.expand_dims(image, axis=0)
            
            # Get predictions
            predictions = self.model.predict(image, verbose=0)
            
            # Process results
            top_indices = np.argsort(predictions[0])[::-1][:5]
            results = []
            
            for i, idx in enumerate(top_indices):
                confidence = float(predictions[0][idx])
                breed_name = self.breed_names[idx]
                
                results.append({
                    'breed': breed_name,
                    'confidence': round(confidence * 100, 2),
                    'rank': i + 1
                })
            
            return {
                'success': True,
                'primary_breed': results[0]['breed'],
                'confidence': results[0]['confidence'],
                'alternatives': results[1:],
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def _dummy_prediction(self):
        """Generate dummy prediction when model is not available"""
        import random
        
        # Select random breed with realistic confidence
        primary_breed = random.choice(self.breed_names)
        confidence = round(random.uniform(75, 95), 2)
        
        # Generate alternatives
        alternatives = []
        remaining_breeds = [b for b in self.breed_names if b != primary_breed]
        for i in range(3):
            alt_breed = random.choice(remaining_breeds)
            remaining_breeds.remove(alt_breed)
            alt_confidence = round(random.uniform(15, 65), 2)
            alternatives.append({
                'breed': alt_breed,
                'confidence': alt_confidence,
                'rank': i + 2
            })
        
        return {
            'success': True,
            'primary_breed': primary_breed,
            'confidence': confidence,
            'alternatives': alternatives,
            'timestamp': datetime.now().isoformat(),
            'note': 'Using dummy prediction - model not loaded'
        }

def load_breed_model(model_path='models/indian_cattle_model.h5'):
    """Load and return trained model"""
    if os.path.exists(model_path):
        try:
            model = tf.keras.models.load_model(model_path)
            return model
        except Exception as e:
            print(f"Error loading model: {e}")
            return None
    else:
        print(f"Model file not found: {model_path}")
        return None

def get_model_info():
    """Get information about the model"""
    return {
        'model_type': 'Indian Cattle & Buffalo Breed Classifier',
        'num_classes': len(INDIAN_BREEDS),
        'supported_breeds': list(INDIAN_BREEDS.keys()),
        'input_size': [224, 224, 3],
        'architecture': 'EfficientNetB4 with custom head'
    }
