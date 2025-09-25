#!/usr/bin/env python3
"""
Image Preprocessing Module for Cattle Breed Recognition
"""

import cv2
import numpy as np
from PIL import Image, ImageEnhance
import os

class ImageProcessor:
    """Handles all image preprocessing operations"""
    
    def __init__(self, target_size=(224, 224)):
        self.target_size = target_size
        self.mean = [0.485, 0.456, 0.406]  # ImageNet means
        self.std = [0.229, 0.224, 0.225]   # ImageNet stds
    
    def preprocess_image(self, image_path):
        """Main preprocessing pipeline"""
        try:
            # Load image
            image = self.load_image(image_path)
            
            # Validate image
            if not self.validate_image(image):
                raise ValueError("Invalid image format or size")
            
            # Enhance image quality
            image = self.enhance_image(image)
            
            # Resize and normalize
            image = self.resize_and_normalize(image)
            
            return image
            
        except Exception as e:
            raise Exception(f"Image preprocessing failed: {str(e)}")
    
    def load_image(self, image_path):
        """Load image from file path"""
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")
        
        try:
            # Load with PIL
            image = Image.open(image_path)
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Convert to numpy array
            image_array = np.array(image)
            
            return image_array
            
        except Exception as e:
            raise Exception(f"Failed to load image: {str(e)}")
    
    def validate_image(self, image):
        """Validate image properties"""
        if image is None:
            return False
        
        # Check dimensions
        if len(image.shape) != 3:
            return False
        
        height, width, channels = image.shape
        
        # Check minimum size
        if height < 50 or width < 50:
            return False
        
        # Check channels
        if channels != 3:
            return False
        
        return True
    
    def enhance_image(self, image):
        """Enhance image quality for better recognition"""
        try:
            # Convert numpy array back to PIL for enhancement
            pil_image = Image.fromarray(image)
            
            # Enhance brightness slightly
            brightness_enhancer = ImageEnhance.Brightness(pil_image)
            image_enhanced = brightness_enhancer.enhance(1.1)
            
            # Enhance contrast
            contrast_enhancer = ImageEnhance.Contrast(image_enhanced)
            image_enhanced = contrast_enhancer.enhance(1.1)
            
            # Enhance sharpness
            sharpness_enhancer = ImageEnhance.Sharpness(image_enhanced)
            image_enhanced = sharpness_enhancer.enhance(1.05)
            
            # Convert back to numpy array
            return np.array(image_enhanced)
            
        except Exception:
            # Return original image if enhancement fails
            return image
    
    def resize_and_normalize(self, image):
        """Resize image and normalize for model input"""
        try:
            # Resize image
            image_resized = cv2.resize(image, self.target_size, interpolation=cv2.INTER_AREA)
            
            # Convert to float32 and normalize to [0, 1]
            image_normalized = image_resized.astype(np.float32) / 255.0
            
            # Apply ImageNet normalization
            for i in range(3):
                image_normalized[:, :, i] = (image_normalized[:, :, i] - self.mean[i]) / self.std[i]
            
            return image_normalized
            
        except Exception as e:
            raise Exception(f"Resize and normalization failed: {str(e)}")
    
    def preprocess_batch(self, image_paths):
        """Preprocess multiple images"""
        batch_images = []
        
        for path in image_paths:
            try:
                processed_image = self.preprocess_image(path)
                batch_images.append(processed_image)
            except Exception as e:
                print(f"Failed to process {path}: {str(e)}")
                continue
        
        if not batch_images:
            raise Exception("No images could be processed")
        
        return np.array(batch_images)

def validate_image(file_path):
    """Standalone image validation function"""
    try:
        processor = ImageProcessor()
        image = processor.load_image(file_path)
        return processor.validate_image(image)
    except Exception:
        return False

def get_image_info(file_path):
    """Get basic information about an image"""
    try:
        image = Image.open(file_path)
        return {
            'width': image.width,
            'height': image.height,
            'mode': image.mode,
            'format': image.format,
            'size_mb': os.path.getsize(file_path) / (1024 * 1024)
        }
    except Exception as e:
        return {'error': str(e)}
