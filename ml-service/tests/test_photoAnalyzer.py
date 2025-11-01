"""
Unit tests for Progress Photo Analyzer

Tests the ML model and image processing functionality.
"""

import pytest
import numpy as np
from PIL import Image
import io
import sys
import os

# Add parent directory to path to import src modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.photoAnalyzer import ProgressPhotoAnalyzer, get_analyzer


class TestProgressPhotoAnalyzer:
    """Test suite for ProgressPhotoAnalyzer class"""
    
    @pytest.fixture
    def analyzer(self):
        """Create analyzer instance for tests"""
        return ProgressPhotoAnalyzer()
    
    @pytest.fixture
    def sample_image(self):
        """Create a sample RGB image for testing"""
        img = Image.new('RGB', (224, 224), color=(128, 128, 128))
        return img
    
    @pytest.fixture
    def sample_image_path(self, tmp_path, sample_image):
        """Save sample image to temp file"""
        img_path = tmp_path / "test_image.jpg"
        sample_image.save(img_path)
        return str(img_path)
    
    def test_analyzer_initialization(self, analyzer):
        """Test that analyzer initializes correctly"""
        assert analyzer is not None
        assert analyzer.model is not None
        assert analyzer.img_size == (224, 224)
    
    def test_preprocess_image_pil(self, analyzer, sample_image):
        """Test image preprocessing with PIL Image input"""
        processed = analyzer.preprocess_image(sample_image)
        
        assert processed.shape == (1, 224, 224, 3)
        assert processed.dtype == np.float32
    
    def test_preprocess_image_path(self, analyzer, sample_image_path):
        """Test image preprocessing with file path input"""
        processed = analyzer.preprocess_image(sample_image_path)
        
        assert processed.shape == (1, 224, 224, 3)
        assert processed.dtype == np.float32
    
    def test_preprocess_image_numpy(self, analyzer):
        """Test image preprocessing with numpy array input"""
        img_array = np.random.randint(0, 255, (300, 300, 3), dtype=np.uint8)
        processed = analyzer.preprocess_image(img_array)
        
        assert processed.shape == (1, 224, 224, 3)
        assert processed.dtype == np.float32
    
    def test_analyze_photo(self, analyzer, sample_image):
        """Test single photo analysis"""
        analysis = analyzer.analyze_photo(sample_image)
        
        # Check all required fields exist
        assert 'body_fat_estimate' in analysis
        assert 'muscle_score' in analysis
        assert 'posture_score' in analysis
        assert 'overall_score' in analysis
        assert 'confidence' in analysis
        assert 'analysis_version' in analysis
        assert 'model_type' in analysis
        
        # Check value ranges
        assert 0 <= analysis['body_fat_estimate'] <= 100
        assert 0 <= analysis['muscle_score'] <= 100
        assert 0 <= analysis['posture_score'] <= 100
        assert 0 <= analysis['overall_score'] <= 100
        assert 0 <= analysis['confidence'] <= 1
    
    def test_compare_photos(self, analyzer, sample_image):
        """Test photo comparison functionality"""
        # Create two slightly different images
        img1 = sample_image
        img2 = Image.new('RGB', (224, 224), color=(150, 150, 150))
        
        comparison = analyzer.compare_photos(img1, img2)
        
        # Check structure
        assert 'before' in comparison
        assert 'after' in comparison
        assert 'improvements' in comparison
        
        # Check improvements structure
        assert 'body_fat_change' in comparison['improvements']
        assert 'muscle_gain' in comparison['improvements']
        assert 'posture_improvement' in comparison['improvements']
        assert 'overall_progress' in comparison['improvements']
    
    def test_detect_pose_quality(self, analyzer, sample_image):
        """Test pose quality detection"""
        quality = analyzer.detect_pose_quality(sample_image)
        
        assert 'edge_clarity' in quality
        assert 'brightness' in quality
        assert 'contrast' in quality
        assert 'quality_score' in quality
        
        # Check value ranges
        assert 0 <= quality['edge_clarity'] <= 100
        assert 0 <= quality['brightness'] <= 100
        assert 0 <= quality['contrast'] <= 100
        assert 0 <= quality['quality_score'] <= 100
    
    def test_calculate_confidence(self, analyzer):
        """Test confidence calculation"""
        # Similar values should give high confidence
        confidence_high = analyzer._calculate_confidence(0.5, 0.52, 0.48)
        assert confidence_high >= 0.7
        
        # Diverse values should give lower confidence
        confidence_low = analyzer._calculate_confidence(0.1, 0.5, 0.9)
        assert confidence_low >= 0.5  # Always at least 50%
    
    def test_get_analyzer_singleton(self):
        """Test singleton pattern for get_analyzer()"""
        analyzer1 = get_analyzer()
        analyzer2 = get_analyzer()
        
        assert analyzer1 is analyzer2
    
    def test_invalid_image_input(self, analyzer):
        """Test handling of invalid image input"""
        # PIL raises FileNotFoundError for non-existent files
        with pytest.raises(FileNotFoundError):
            analyzer.preprocess_image("not_a_valid_path.jpg")
    
    def test_model_outputs_shape(self, analyzer, sample_image):
        """Test that model produces correct output shapes"""
        processed = analyzer.preprocess_image(sample_image)
        outputs = analyzer.model.predict(processed, verbose=0)
        
        # Should have 3 outputs (body_fat, muscle, posture)
        assert len(outputs) == 3
        
        # Each output should have shape (1, 1)
        for output in outputs:
            assert output.shape == (1, 1)
    
    def test_analyze_different_image_sizes(self, analyzer):
        """Test analysis with different input image sizes"""
        sizes = [(100, 100), (500, 500), (1920, 1080)]
        
        for size in sizes:
            img = Image.new('RGB', size, color=(128, 128, 128))
            analysis = analyzer.analyze_photo(img)
            
            # Should work regardless of input size
            assert 'overall_score' in analysis
            assert 0 <= analysis['overall_score'] <= 100
