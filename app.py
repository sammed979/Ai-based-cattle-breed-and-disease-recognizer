
#!/usr/bin/env python3
"""
Main Flask Server for Indian Cattle Breed Recognition System
"""

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
import numpy as np
import cv2
from PIL import Image
import tensorflow as tf
from werkzeug.utils import secure_filename
import json
from datetime import datetime

# Import custom modules
from model import CattleBreedClassifier
from image_processing import ImageProcessor
from utils import allowed_file, create_response, get_breed_info

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'cattle-breed-recognition-2024'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

# Enable CORS
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
MODEL_PATH = 'models/indian_cattle_model.h5'

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Global variables
model_classifier = None
image_processor = None

def initialize_application():
    """Initialize the application components"""
    global model_classifier, image_processor
    
    try:
        image_processor = ImageProcessor()
        model_classifier = CattleBreedClassifier()
        
        if os.path.exists(MODEL_PATH):
            model_classifier.load_model(MODEL_PATH)
            print("AI model loaded successfully")
        else:
            print("Model file not found, using dummy predictions")
            
    except Exception as e:
        print(f"Failed to initialize: {str(e)}")
        raise

# Routes
@app.route('/')
def index():
    """Serve the main frontend page"""
    return render_template('index.html')

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return create_response(
        success=True,
        data={
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'model_loaded': model_classifier is not None
        }
    )

@app.route('/api/breeds', methods=['GET'])
def get_supported_breeds():
    """Get list of supported Indian breeds"""
    breeds = get_breed_info()
    return create_response(success=True, data={'breeds': breeds})

@app.route('/api/predict', methods=['POST'])
def predict_breed():
    """Main prediction endpoint"""
    try:
        if 'image' not in request.files:
            return create_response(False, error='No image file provided')
        
        file = request.files['image']
        
        if file.filename == '' or not allowed_file(file.filename):
            return create_response(False, error='Invalid file format')
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
        filename = timestamp + filename
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Process image and predict
        processed_image = image_processor.preprocess_image(filepath)
        prediction_result = model_classifier.predict(processed_image)
        
        # Clean up uploaded file
        os.remove(filepath)
        
        return create_response(success=True, data=prediction_result)
        
    except Exception as e:
        return create_response(False, error=str(e))

@app.route('/api/upload', methods=['POST'])
def upload_image():
    """Handle image upload"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
            
        file = request.files['file']
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
            filename = timestamp + filename
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            return jsonify({
                'success': True,
                'filename': filename,
                'filepath': filepath
            })
        
        return jsonify({'error': 'Invalid file type'}), 400
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Error handlers
@app.errorhandler(413)
def too_large(e):
    return create_response(False, error="File too large. Max size: 16MB")

@app.errorhandler(404)
def not_found(e):
    return create_response(False, error="Endpoint not found")

@app.errorhandler(500)
def server_error(e):
    return create_response(False, error="Internal server error")

if __name__ == '__main__':
    initialize_application()
    app.run(debug=True, host='0.0.0.0', port=5000)
