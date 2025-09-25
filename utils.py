#!/usr/bin/env python3
"""
Utility Functions for Cattle Breed Recognition System
"""

import os
import json
from datetime import datetime
from flask import jsonify

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def create_response(success, data=None, error=None):
    """Create standardized API response"""
    response = {
        'success': success,
        'timestamp': datetime.now().isoformat()
    }
    
    if data:
        response['data'] = data
    
    if error:
        response['error'] = error
    
    return jsonify(response)

def get_breed_info():
    """Get comprehensive breed information"""
    return {
        'Gir': {
            'type': 'Zebu Cattle',
            'origin': 'Gujarat, India',
            'milk_yield': '1200-1800 L/year',
            'characteristics': ['Curved horns', 'Red/white patches', 'Heat tolerant']
        },
        'Sahiwal': {
            'type': 'Zebu Cattle', 
            'origin': 'Punjab, Pakistan/India',
            'milk_yield': '1400-2500 L/year',
            'characteristics': ['Brown/red color', 'High milk fat', 'Disease resistant']
        },
        'Murrah': {
            'type': 'Water Buffalo',
            'origin': 'Haryana, India',
            'milk_yield': '2000-3000 L/year',
            'characteristics': ['Jet black', 'Curved horns', 'High milk yield']
        },
        'Red_Sindhi': {
            'type': 'Zebu Cattle',
            'origin': 'Sindh region',
            'milk_yield': '1100-2200 L/year',
            'characteristics': ['Red color', 'Compact build', 'Dual purpose']
        },
        'Tharparkar': {
            'type': 'Zebu Cattle',
            'origin': 'Rajasthan, India',
            'milk_yield': '1000-1800 L/year',
            'characteristics': ['White/grey', 'Desert adapted', 'Drought tolerant']
        }
    }

def log_prediction(image_path, prediction_result):
    """Log prediction results for analytics"""
    try:
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'image_path': image_path,
            'prediction': prediction_result,
            'confidence': prediction_result.get('confidence', 0)
        }
        
        # Ensure logs directory exists
        os.makedirs('logs', exist_ok=True)
        
        # Append to log file
        with open('logs/predictions.jsonl', 'a') as f:
            f.write(json.dumps(log_entry) + '\n')
            
    except Exception as e:
        print(f"Failed to log prediction: {str(e)}")

def calculate_confidence_score(probabilities):
    """Calculate confidence score from prediction probabilities"""
    if not probabilities:
        return 0.0
    
    # Get top probability
    max_prob = max(probabilities)
    
    # Calculate confidence based on margin
    sorted_probs = sorted(probabilities, reverse=True)
    if len(sorted_probs) > 1:
        margin = sorted_probs[0] - sorted_probs[1]
        confidence = (max_prob + margin) / 2
    else:
        confidence = max_prob
    
    return min(confidence * 100, 100.0)  # Cap at 100%

def validate_upload_size(file_size, max_size_mb=16):
    """Validate uploaded file size"""
    max_bytes = max_size_mb * 1024 * 1024
    return file_size <= max_bytes

def clean_old_uploads(upload_dir, max_age_hours=24):
    """Clean up old uploaded files"""
    try:
        current_time = datetime.now()
        
        for filename in os.listdir(upload_dir):
            file_path = os.path.join(upload_dir, filename)
            
            if os.path.isfile(file_path):
                file_time = datetime.fromtimestamp(os.path.getctime(file_path))
                age_hours = (current_time - file_time).total_seconds() / 3600
                
                if age_hours > max_age_hours:
                    os.remove(file_path)
                    print(f"Cleaned up old file: {filename}")
                    
    except Exception as e:
        print(f"Error cleaning uploads: {str(e)}")

def format_breed_name(breed_name):
    """Format breed name for display"""
    return breed_name.replace('_', ' ').title()

def get_breed_category(breed_name):
    """Get breed category (cattle/buffalo)"""
    buffalo_breeds = {
        'Murrah', 'Nili_Ravi', 'Kundi', 'Surti', 'Jafarabadi',
        'Bhadawari', 'Tarai', 'Marathwadi', 'Pandharpuri',
        'Kalahandi', 'Sambalpuri', 'Chilika', 'Mehsana', 'Nagpuri',
        'Toda', 'Jaffarabadi', 'Wild_Buffalo', 'Forest_Buffalo'
    }
    
    return 'Buffalo' if breed_name in buffalo_breeds else 'Cattle'

def create_error_response(error_message, status_code=400):
    """Create error response with proper status code"""
    return create_response(
        success=False,
        error=error_message
    ), status_code

def safe_filename(filename):
    """Create safe filename"""
    # Remove unsafe characters
    safe_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-"
    safe_name = "".join(c for c in filename if c in safe_chars)
    
    # Add timestamp to avoid conflicts
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_")
    
    return timestamp + safe_name

def get_system_stats():
    """Get system statistics"""
    import psutil
    
    return {
        'cpu_percent': psutil.cpu_percent(),
        'memory_percent': psutil.virtual_memory().percent,
        'disk_usage': psutil.disk_usage('/').percent
    }
