"""
Integration tests for Flask API

Tests all API endpoints of the ML service.
"""

import pytest
import sys
import os
from PIL import Image
import io

# Add parent directory to path to import src modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.app import app


@pytest.fixture
def client():
    """Create test client"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def sample_image_file():
    """Create sample image file for upload"""
    img = Image.new('RGB', (224, 224), color=(128, 128, 128))
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes


class TestAPIEndpoints:
    """Test suite for API endpoints"""
    
    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get('/health')
        
        assert response.status_code == 200
        data = response.get_json()
        
        assert data['status'] == 'healthy'
        assert data['service'] == 'ml-service'
        assert 'model_loaded' in data
        assert 'version' in data
    
    def test_analyze_photo_success(self, client, sample_image_file):
        """Test successful photo analysis"""
        response = client.post(
            '/api/ml/analyze',
            data={'photo': (sample_image_file, 'test.jpg')},
            content_type='multipart/form-data'
        )
        
        assert response.status_code == 200
        data = response.get_json()
        
        assert data['success'] is True
        assert 'analysis' in data
        
        analysis = data['analysis']
        assert 'body_fat_estimate' in analysis
        assert 'muscle_score' in analysis
        assert 'posture_score' in analysis
        assert 'overall_score' in analysis
        assert 'confidence' in analysis
    
    def test_analyze_photo_with_quality(self, client, sample_image_file):
        """Test photo analysis with quality metrics"""
        response = client.post(
            '/api/ml/analyze?include_quality=true',
            data={'photo': (sample_image_file, 'test.jpg')},
            content_type='multipart/form-data'
        )
        
        assert response.status_code == 200
        data = response.get_json()
        
        assert 'analysis' in data
        assert 'pose_quality' in data['analysis']
        
        quality = data['analysis']['pose_quality']
        assert 'edge_clarity' in quality
        assert 'brightness' in quality
        assert 'contrast' in quality
    
    def test_analyze_photo_no_file(self, client):
        """Test analysis without file upload"""
        response = client.post('/api/ml/analyze')
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert 'error' in data
    
    def test_analyze_photo_invalid_type(self, client):
        """Test analysis with invalid file type"""
        # Create text file instead of image
        text_file = io.BytesIO(b"not an image")
        
        response = client.post(
            '/api/ml/analyze',
            data={'photo': (text_file, 'test.txt')},
            content_type='multipart/form-data'
        )
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
    
    def test_compare_photos_success(self, client, sample_image_file):
        """Test successful photo comparison"""
        # Create second image
        img2 = Image.new('RGB', (224, 224), color=(150, 150, 150))
        img2_bytes = io.BytesIO()
        img2.save(img2_bytes, format='JPEG')
        img2_bytes.seek(0)
        
        response = client.post(
            '/api/ml/compare',
            data={
                'photo1': (sample_image_file, 'test1.jpg'),
                'photo2': (img2_bytes, 'test2.jpg')
            },
            content_type='multipart/form-data'
        )
        
        assert response.status_code == 200
        data = response.get_json()
        
        assert data['success'] is True
        assert 'comparison' in data
        
        comparison = data['comparison']
        assert 'before' in comparison
        assert 'after' in comparison
        assert 'improvements' in comparison
    
    def test_compare_photos_missing_photo(self, client, sample_image_file):
        """Test comparison with missing photo"""
        response = client.post(
            '/api/ml/compare',
            data={'photo1': (sample_image_file, 'test.jpg')},
            content_type='multipart/form-data'
        )
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
    
    def test_batch_analyze_success(self, client):
        """Test batch analysis with multiple photos"""
        # Create 3 sample images
        images = []
        for i in range(3):
            img = Image.new('RGB', (224, 224), color=(100 + i*20, 100 + i*20, 100 + i*20))
            img_bytes = io.BytesIO()
            img.save(img_bytes, format='JPEG')
            img_bytes.seek(0)
            images.append((img_bytes, f'test{i}.jpg'))
        
        response = client.post(
            '/api/ml/batch-analyze',
            data={'photos[]': images},
            content_type='multipart/form-data'
        )
        
        assert response.status_code == 200
        data = response.get_json()
        
        assert data['success'] is True
        assert 'results' in data
        assert data['total'] == 3
        assert len(data['results']) == 3
    
    def test_batch_analyze_too_many(self, client):
        """Test batch analysis with too many photos"""
        # Try to upload 11 photos (max is 10)
        images = []
        for i in range(11):
            img = Image.new('RGB', (100, 100), color=(100, 100, 100))
            img_bytes = io.BytesIO()
            img.save(img_bytes, format='JPEG')
            img_bytes.seek(0)
            images.append((img_bytes, f'test{i}.jpg'))
        
        response = client.post(
            '/api/ml/batch-analyze',
            data={'photos[]': images},
            content_type='multipart/form-data'
        )
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
    
    def test_404_endpoint(self, client):
        """Test non-existent endpoint"""
        response = client.get('/api/ml/nonexistent')
        
        assert response.status_code == 404
        data = response.get_json()
        assert data['success'] is False
