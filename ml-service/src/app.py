"""
Flask REST API for Progress Photo Analysis ML Service

Provides endpoints for:
- Health checks
- Single photo analysis
- Photo comparison
- Batch processing
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import traceback
from PIL import Image
import io
import base64

from src.photoAnalyzer import get_analyzer

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests from Node.js backend

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max file size
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}

# Initialize ML model
print("Initializing ML model...")
analyzer = get_analyzer()
print("ML model ready!")


def allowed_file(filename):
    """
    Check if file extension is allowed.
    
    Args:
        filename (str): Name of the uploaded file
        
    Returns:
        bool: True if file type is allowed
    """
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint for Docker healthcheck.
    
    Returns:
        JSON response with service status
    """
    return jsonify({
        'status': 'healthy',
        'service': 'ml-service',
        'model_loaded': analyzer is not None,
        'version': '1.0.0'
    }), 200


@app.route('/api/ml/analyze', methods=['POST'])
def analyze_photo():
    """
    Analyze a single progress photo.
    
    Expects:
        - Multipart form data with 'photo' file
        OR
        - JSON with base64 encoded image
        
    Returns:
        JSON with analysis results:
        {
            'success': bool,
            'analysis': {
                'body_fat_estimate': float,
                'muscle_score': float,
                'posture_score': float,
                'overall_score': float,
                'confidence': float
            }
        }
    """
    try:
        image = None
        
        # Handle file upload
        if 'photo' in request.files:
            file = request.files['photo']
            
            if file.filename == '':
                return jsonify({
                    'success': False,
                    'error': 'No file selected'
                }), 400
            
            if not allowed_file(file.filename):
                return jsonify({
                    'success': False,
                    'error': 'Invalid file type. Allowed: png, jpg, jpeg, webp, gif'
                }), 400
            
            # Read image from upload
            image = Image.open(file.stream)
        
        # Handle base64 encoded image
        elif request.is_json:
            data = request.get_json()
            
            if 'image' not in data:
                return jsonify({
                    'success': False,
                    'error': 'No image data provided'
                }), 400
            
            # Decode base64 image
            try:
                image_data = base64.b64decode(data['image'])
                image = Image.open(io.BytesIO(image_data))
            except Exception as e:
                return jsonify({
                    'success': False,
                    'error': f'Invalid base64 image data: {str(e)}'
                }), 400
        else:
            return jsonify({
                'success': False,
                'error': 'No image data provided'
            }), 400
        
        # Extract optional body metrics from form data or JSON
        weight = None
        height = None
        age = None
        gender = 'male'
        
        if 'weight' in request.form:
            try:
                weight = float(request.form['weight'])
            except (ValueError, TypeError):
                pass
        
        if 'height' in request.form:
            try:
                height = float(request.form['height'])
            except (ValueError, TypeError):
                pass
        
        if 'age' in request.form:
            try:
                age = int(request.form['age'])
            except (ValueError, TypeError):
                pass
        
        if 'gender' in request.form:
            gender = request.form['gender'].lower()
        
        # If JSON request, check for metrics in JSON body
        if request.is_json:
            data = request.get_json()
            weight = data.get('weight')
            height = data.get('height')
            age = data.get('age')
            gender = data.get('gender', 'male').lower()
        
        # Perform analysis with optional body metrics
        analysis = analyzer.analyze_photo(
            image, 
            weight=weight, 
            height=height, 
            age=age, 
            gender=gender
        )
        
        # Optional: Add pose quality analysis
        if request.args.get('include_quality') == 'true':
            quality = analyzer.detect_pose_quality(image)
            analysis['pose_quality'] = quality
        
        return jsonify({
            'success': True,
            'analysis': analysis
        }), 200
        
    except Exception as e:
        print(f"Error analyzing photo: {str(e)}")
        print(traceback.format_exc())
        
        return jsonify({
            'success': False,
            'error': f'Analysis failed: {str(e)}'
        }), 500


@app.route('/api/ml/compare', methods=['POST'])
def compare_photos():
    """
    Compare two progress photos to show improvement.
    
    Expects:
        - Multipart form data with 'photo1' and 'photo2' files
        OR
        - JSON with base64 encoded images
        
    Returns:
        JSON with comparison results including deltas
    """
    try:
        photo1 = None
        photo2 = None
        
        # Handle file uploads
        if 'photo1' in request.files and 'photo2' in request.files:
            file1 = request.files['photo1']
            file2 = request.files['photo2']
            
            if not (allowed_file(file1.filename) and allowed_file(file2.filename)):
                return jsonify({
                    'success': False,
                    'error': 'Invalid file types'
                }), 400
            
            photo1 = Image.open(file1.stream)
            photo2 = Image.open(file2.stream)
        
        # Handle JSON with base64
        elif request.is_json:
            data = request.get_json()
            
            if 'photo1' not in data or 'photo2' not in data:
                return jsonify({
                    'success': False,
                    'error': 'Both photo1 and photo2 required'
                }), 400
            
            try:
                image1_data = base64.b64decode(data['photo1'])
                image2_data = base64.b64decode(data['photo2'])
                photo1 = Image.open(io.BytesIO(image1_data))
                photo2 = Image.open(io.BytesIO(image2_data))
            except Exception as e:
                return jsonify({
                    'success': False,
                    'error': f'Invalid base64 image data: {str(e)}'
                }), 400
        else:
            return jsonify({
                'success': False,
                'error': 'No photos provided'
            }), 400
        
        # Perform comparison
        comparison = analyzer.compare_photos(photo1, photo2)
        
        return jsonify({
            'success': True,
            'comparison': comparison
        }), 200
        
    except Exception as e:
        print(f"Error comparing photos: {str(e)}")
        print(traceback.format_exc())
        
        return jsonify({
            'success': False,
            'error': f'Comparison failed: {str(e)}'
        }), 500


@app.route('/api/ml/batch-analyze', methods=['POST'])
def batch_analyze():
    """
    Analyze multiple photos at once.
    
    Expects:
        - Multipart form data with multiple 'photos[]' files
        
    Returns:
        JSON with array of analysis results
    """
    try:
        files = request.files.getlist('photos[]')
        
        if not files or len(files) == 0:
            return jsonify({
                'success': False,
                'error': 'No photos provided'
            }), 400
        
        if len(files) > 10:
            return jsonify({
                'success': False,
                'error': 'Maximum 10 photos per batch'
            }), 400
        
        results = []
        
        for idx, file in enumerate(files):
            if not allowed_file(file.filename):
                results.append({
                    'index': idx,
                    'filename': file.filename,
                    'success': False,
                    'error': 'Invalid file type'
                })
                continue
            
            try:
                image = Image.open(file.stream)
                analysis = analyzer.analyze_photo(image)
                
                results.append({
                    'index': idx,
                    'filename': file.filename,
                    'success': True,
                    'analysis': analysis
                })
            except Exception as e:
                results.append({
                    'index': idx,
                    'filename': file.filename,
                    'success': False,
                    'error': str(e)
                })
        
        return jsonify({
            'success': True,
            'total': len(files),
            'results': results
        }), 200
        
    except Exception as e:
        print(f"Error in batch analysis: {str(e)}")
        print(traceback.format_exc())
        
        return jsonify({
            'success': False,
            'error': f'Batch analysis failed: {str(e)}'
        }), 500


@app.errorhandler(413)
def request_entity_too_large(error):
    """Handle file too large error."""
    return jsonify({
        'success': False,
        'error': 'File too large. Maximum size is 10MB'
    }), 413


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500


if __name__ == '__main__':
    # Development server
    app.run(host='0.0.0.0', port=5001, debug=True)
