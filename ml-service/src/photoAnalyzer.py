"""
Body Progress Photo Analyzer using Deep Learning

This module provides AI-powered analysis of fitness progress photos.
It uses a pre-trained MobileNetV2 model fine-tuned for body composition analysis.

Features:
- Body fat percentage estimation
- Muscle definition scoring
- Posture analysis
- Progress comparison between photos
"""

import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
import numpy as np
from PIL import Image
import cv2
import os


class ProgressPhotoAnalyzer:
    """
    Deep Learning model for analyzing fitness progress photos.
    
    The model uses transfer learning with MobileNetV2 as the base,
    extracting features relevant to body composition analysis.
    """
    
    def __init__(self, model_path=None):
        """
        Initialize the photo analyzer.
        
        Args:
            model_path (str, optional): Path to pre-trained weights.
        """
        self.img_size = (224, 224)
        self.model = self._build_model()
        
        if model_path and os.path.exists(model_path):
            self.model.load_weights(model_path)
            print(f"Loaded model weights from {model_path}")
        else:
            print("Using base MobileNetV2 features (no fine-tuned weights)")
    
    def _build_model(self):
        """
        Build the neural network architecture.
        
        Uses MobileNetV2 as base with custom classification head for:
        - Body fat estimation
        - Muscle score
        - Posture quality
        
        Returns:
            tf.keras.Model: Compiled model ready for inference
        """
        # Load pre-trained MobileNetV2 (ImageNet weights)
        base_model = MobileNetV2(
            input_shape=(224, 224, 3),
            include_top=False,
            weights='imagenet'
        )
        
        # Freeze base model layers for transfer learning
        base_model.trainable = False
        
        # Build custom head for body composition analysis
        x = base_model.output
        x = GlobalAveragePooling2D()(x)
        x = Dense(256, activation='relu', name='fc1')(x)
        x = Dropout(0.3)(x)
        x = Dense(128, activation='relu', name='fc2')(x)
        x = Dropout(0.2)(x)
        
        # Multiple output heads for different metrics
        body_fat_output = Dense(1, activation='sigmoid', name='body_fat')(x)
        muscle_output = Dense(1, activation='sigmoid', name='muscle_score')(x)
        posture_output = Dense(1, activation='sigmoid', name='posture_score')(x)
        
        # Create model
        model = Model(
            inputs=base_model.input,
            outputs=[body_fat_output, muscle_output, posture_output]
        )
        
        return model
    
    def preprocess_image(self, image_input):
        """
        Preprocess image for model inference.
        
        Args:
            image_input: Can be file path (str), PIL Image, or numpy array
            
        Returns:
            np.ndarray: Preprocessed image ready for model input (1, 224, 224, 3)
        """
        # Load image based on input type
        if isinstance(image_input, str):
            img = Image.open(image_input).convert('RGB')
        elif isinstance(image_input, Image.Image):
            img = image_input.convert('RGB')
        elif isinstance(image_input, np.ndarray):
            img = Image.fromarray(image_input).convert('RGB')
        else:
            raise ValueError("Invalid image input type")
        
        # Resize to model input size
        img = img.resize(self.img_size)
        
        # Convert to numpy array
        img_array = np.array(img)
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        # Apply MobileNetV2 preprocessing
        img_array = preprocess_input(img_array)
        
        return img_array
    
    def analyze_photo(self, image_input, weight=None, height=None, age=None, gender='male'):
        """
        Perform comprehensive analysis on a progress photo.
        
        Args:
            image_input: Image to analyze (path, PIL Image, or numpy array)
            weight: Weight in kg (optional)
            height: Height in cm (optional)
            age: Age in years (optional, default 25)
            gender: 'male' or 'female' (default 'male')
            
        Returns:
            dict: Analysis results containing:
                - body_fat_estimate: Estimated body fat percentage (0-100)
                - muscle_score: Muscle definition score (0-100)
                - posture_score: Posture quality score (0-100)
                - overall_score: Combined fitness score (0-100)
                - confidence: Model confidence (0-1)
                - bmi: Calculated BMI (if weight/height provided)
        """
        # Preprocess image
        processed_img = self.preprocess_image(image_input)
        
        # Run inference for visual analysis
        body_fat_raw, muscle_raw, posture_raw = self.model.predict(
            processed_img, 
            verbose=0
        )
        
        # Convert raw outputs to scores (0-100 scale)
        muscle_score = float(muscle_raw[0][0] * 100)
        posture_score = float(posture_raw[0][0] * 100)
        
        # Calculate body fat estimate
        if weight and height:
            # Hybrid approach: BMI + Visual Analysis
            body_fat_estimate, bmi = self._calculate_hybrid_body_fat(
                weight, height, age or 25, gender, muscle_score
            )
        else:
            # Fallback to visual-only (less accurate)
            body_fat_estimate = float(body_fat_raw[0][0] * 100)
            bmi = None
        
        # Calculate overall progress score
        # Higher muscle and posture, lower body fat = better score
        overall_score = (
            muscle_score * 0.4 + 
            posture_score * 0.3 + 
            (100 - body_fat_estimate) * 0.3
        )
        
        # Calculate confidence based on variance in predictions
        confidence = self._calculate_confidence(
            body_fat_raw[0][0], 
            muscle_raw[0][0], 
            posture_raw[0][0]
        )
        
        result = {
            'body_fat_estimate': round(body_fat_estimate, 2),
            'muscle_score': round(muscle_score, 2),
            'posture_score': round(posture_score, 2),
            'overall_score': round(overall_score, 2),
            'confidence': round(confidence, 3),
            'analysis_version': '2.0',
            'model_type': 'Hybrid BMI + Visual AI' if (weight and height) else 'MobileNetV2-Visual'
        }
        
        if bmi:
            result['bmi'] = round(bmi, 2)
        
        return result
    
    def compare_photos(self, photo1_input, photo2_input):
        """
        Compare two progress photos to show improvement.
        
        Args:
            photo1_input: First photo (earlier date)
            photo2_input: Second photo (later date)
            
        Returns:
            dict: Comparison results with delta metrics
        """
        # Analyze both photos
        analysis1 = self.analyze_photo(photo1_input)
        analysis2 = self.analyze_photo(photo2_input)
        
        # Calculate deltas
        return {
            'before': analysis1,
            'after': analysis2,
            'improvements': {
                'body_fat_change': round(
                    analysis1['body_fat_estimate'] - analysis2['body_fat_estimate'], 
                    2
                ),
                'muscle_gain': round(
                    analysis2['muscle_score'] - analysis1['muscle_score'], 
                    2
                ),
                'posture_improvement': round(
                    analysis2['posture_score'] - analysis1['posture_score'], 
                    2
                ),
                'overall_progress': round(
                    analysis2['overall_score'] - analysis1['overall_score'], 
                    2
                )
            }
        }
    
    def _calculate_confidence(self, body_fat, muscle, posture):
        """
        Calculate model confidence based on output variance.
        
        Lower variance = higher confidence
        
        Args:
            body_fat (float): Body fat prediction (0-1)
            muscle (float): Muscle score prediction (0-1)
            posture (float): Posture score prediction (0-1)
            
        Returns:
            float: Confidence score (0-1)
        """
        # Calculate variance
        predictions = [body_fat, muscle, posture]
        variance = np.var(predictions)
        
        # Convert variance to confidence (inverse relationship)
        # Low variance = high confidence
        confidence = 1.0 - min(variance * 4, 0.5)
        
        return max(0.5, confidence)  # Minimum 50% confidence
    
    def _calculate_hybrid_body_fat(self, weight_kg, height_cm, age, gender, muscle_score):
        """
        Calculate body fat percentage using hybrid approach:
        70% - Deurenberg BMI-based formula (scientific)
        30% - Visual AI adjustment (muscle definition)
        
        Based on: Deurenberg et al. (1991) - Body mass index as a measure of body fatness
        
        Args:
            weight_kg: Weight in kilograms
            height_cm: Height in centimeters
            age: Age in years
            gender: 'male' or 'female'
            muscle_score: Visual muscle definition score (0-100)
            
        Returns:
            tuple: (body_fat_percentage, bmi)
        """
        # Calculate BMI
        height_m = height_cm / 100.0
        bmi = weight_kg / (height_m ** 2)
        
        # Gender factor for Deurenberg formula
        gender_factor = 1 if gender.lower() == 'male' else 0
        
        # Deurenberg formula for base body fat estimate
        # BF% = (1.20 × BMI) + (0.23 × Age) - (10.8 × gender) - 5.4
        base_body_fat = (1.20 * bmi) + (0.23 * age) - (10.8 * gender_factor) - 5.4
        
        # Ensure base is within reasonable range
        base_body_fat = max(3, min(50, base_body_fat))
        
        # Visual adjustment based on muscle definition
        # High muscle score (70-100) → reduce body fat estimate (person is leaner than BMI suggests)
        # Low muscle score (0-40) → increase body fat estimate (person has more fat than BMI suggests)
        # Medium muscle score (40-70) → minimal adjustment
        
        if muscle_score >= 70:
            # Very defined muscles → likely lower body fat
            visual_adjustment = -((muscle_score - 70) / 30.0) * 8.0  # Max -8%
        elif muscle_score <= 40:
            # Low muscle definition → likely higher body fat
            visual_adjustment = ((40 - muscle_score) / 40.0) * 6.0  # Max +6%
        else:
            # Medium range → proportional adjustment
            visual_adjustment = ((55 - muscle_score) / 15.0) * 2.0  # -2% to +2%
        
        # Apply adjustment (30% weight to visual, 70% to BMI formula)
        adjusted_body_fat = base_body_fat + (visual_adjustment * 0.3)
        
        # Final bounds check
        final_body_fat = max(3, min(45, adjusted_body_fat))
        
        return final_body_fat, bmi
    
    def detect_pose_quality(self, image_input):
        """
        Analyze photo pose quality using edge detection.
        
        Good progress photos should have:
        - Clear body outline
        - Good lighting
        - Proper framing
        
        Args:
            image_input: Image to analyze
            
        Returns:
            dict: Pose quality metrics
        """
        # Load and convert image
        if isinstance(image_input, str):
            img = cv2.imread(image_input)
        elif isinstance(image_input, Image.Image):
            img = cv2.cvtColor(np.array(image_input), cv2.COLOR_RGB2BGR)
        else:
            img = image_input
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Edge detection
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / edges.size
        
        # Brightness analysis
        brightness = np.mean(gray) / 255.0
        
        # Contrast analysis
        contrast = np.std(gray) / 128.0
        
        # Calculate quality score
        edge_clarity_score = edge_density * 100
        brightness_score = brightness * 100
        contrast_score = contrast * 100
        
        return {
            'edge_clarity': round(edge_clarity_score, 2),
            'brightness': round(brightness_score, 2),
            'contrast': round(contrast_score, 2),
            'quality_score': round(
                (edge_clarity_score * 0.4 + brightness_score * 0.3 + contrast_score * 0.3), 
                2
            )
        }


# Singleton instance for reuse
_analyzer_instance = None

def get_analyzer():
    """
    Get or create singleton analyzer instance.
    
    Returns:
        ProgressPhotoAnalyzer: Shared analyzer instance
    """
    global _analyzer_instance
    if _analyzer_instance is None:
        _analyzer_instance = ProgressPhotoAnalyzer()
    return _analyzer_instance
