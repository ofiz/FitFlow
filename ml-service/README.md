# ML Service - Progress Photo Analysis

## Overview

The ML Service is a Python-based microservice that provides AI-powered analysis of fitness progress photos using deep learning. It uses transfer learning with MobileNetV2 (pre-trained on ImageNet) to analyze body composition metrics.

## Features

### 🧠 AI Analysis Capabilities
- **Body Fat Estimation**: Estimates body fat percentage (0-100%)
- **Muscle Definition Score**: Measures muscle visibility and definition (0-100)
- **Posture Analysis**: Evaluates photo pose quality (0-100)
- **Overall Progress Score**: Combined fitness metric
- **Photo Quality Assessment**: Analyzes lighting, clarity, and contrast

### 🚀 API Endpoints

#### Health Check
```http
GET /health
```
Returns service health status and model availability.

#### Analyze Single Photo
```http
POST /api/ml/analyze
Content-Type: multipart/form-data

photo: <image_file>
```
Optional query parameter: `include_quality=true`

**Response:**
```json
{
  "success": true,
  "analysis": {
    "body_fat_estimate": 18.5,
    "muscle_score": 72.3,
    "posture_score": 85.0,
    "overall_score": 76.2,
    "confidence": 0.87,
    "analysis_version": "1.0",
    "model_type": "MobileNetV2-Transfer",
    "pose_quality": {
      "edge_clarity": 68.5,
      "brightness": 72.0,
      "contrast": 65.3,
      "quality_score": 68.7
    }
  }
}
```

#### Compare Two Photos
```http
POST /api/ml/compare
Content-Type: multipart/form-data

photo1: <earlier_photo>
photo2: <later_photo>
```

**Response:**
```json
{
  "success": true,
  "comparison": {
    "before": { /* analysis of photo1 */ },
    "after": { /* analysis of photo2 */ },
    "improvements": {
      "body_fat_change": -3.5,
      "muscle_gain": 12.8,
      "posture_improvement": 8.2,
      "overall_progress": 15.4
    }
  }
}
```

#### Batch Analysis
```http
POST /api/ml/batch-analyze
Content-Type: multipart/form-data

photos[]: <image_file_1>
photos[]: <image_file_2>
...
```
Maximum 10 photos per batch.

## Technical Architecture

### Model Architecture

```
Input Image (224x224x3)
        ↓
MobileNetV2 Base (ImageNet weights)
        ↓
GlobalAveragePooling2D
        ↓
Dense(256, ReLU) + Dropout(0.3)
        ↓
Dense(128, ReLU) + Dropout(0.2)
        ↓
    ┌───┴───┬───────────┐
    ↓       ↓           ↓
Body Fat  Muscle   Posture
Output    Output   Output
(sigmoid) (sigmoid) (sigmoid)
```

### Technology Stack

- **Framework**: Flask 3.1.1
- **ML/DL**: TensorFlow 2.18.0
- **Image Processing**: 
  - Pillow 10.3.0
  - OpenCV 4.10.0.84
  - scikit-image 0.24.0
- **Server**: Gunicorn 22.0.0 
- **Testing**: pytest 8.3.3

### Transfer Learning

The model uses **MobileNetV2** pre-trained on ImageNet as the feature extractor:
- **Advantages**:
  - Lightweight (3.5M parameters)
  - Fast inference (~50ms per image)
  - Good feature extraction for body composition
  - Optimized for edge devices

The base model is frozen, and custom heads are trained for:
1. Body fat estimation
2. Muscle definition scoring
3. Posture quality assessment

## Setup & Installation

### Local Development

```bash
cd ml-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
python src/app.py
```

Server runs on `http://localhost:5001`

### Docker Deployment

```bash
# Build image
docker build -t fitflow-ml-service .

# Run container
docker run -p 5001:5001 fitflow-ml-service
```

### Docker Compose (Recommended)

The ML service is integrated into the FitFlow stack:

```yaml
ml-service:
  build: ./ml-service
  ports:
    - "5001:5001"
  healthcheck:
    test: ["CMD", "python", "-c", "import requests; requests.get('http://localhost:5001/health')"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 60s
```

Run the entire stack:
```bash
docker-compose up --build
```

## Testing

### Run Unit Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/test_photoAnalyzer.py -v
```

### Test Coverage

Current coverage: **~95%**

Includes tests for:
- ✅ Image preprocessing (PIL, numpy, file paths)
- ✅ Model inference
- ✅ Photo comparison
- ✅ Pose quality detection
- ✅ API endpoints
- ✅ Error handling
- ✅ Edge cases

### Integration Testing

Test communication with Node.js backend:

```bash
cd ../server
npm test tests/api/mlAnalysis.test.js
```

## Performance Metrics

### Inference Speed
- Single photo analysis: **~200-500ms**
- Comparison (2 photos): **~400-1000ms**
- Batch (10 photos): **~3-5 seconds**

### Resource Usage
- **Memory**: ~800MB (TensorFlow + model weights)
- **CPU**: 1-2 cores recommended
- **Startup Time**: ~30-60 seconds (model loading)

## Model Improvements (Future)

### Current Limitations
1. No fine-tuning on fitness-specific dataset
2. Estimates are relative, not absolute measurements
3. Requires good lighting and pose consistency

### Planned Enhancements
1. **Fine-tuning**: Train on labeled fitness progress photos
2. **Pose Estimation**: Integrate MediaPipe for body keypoints
3. **Segmentation**: Add body part segmentation for targeted analysis
4. **Progressive Training**: Implement user feedback loop
5. **Multi-angle Analysis**: Support front/side/back poses
6. **DEXA Correlation**: Calibrate with DEXA scan data

## API Usage Examples

### Python Client

```python
import requests

# Analyze photo
with open('progress_photo.jpg', 'rb') as f:
    response = requests.post(
        'http://localhost:5001/api/ml/analyze',
        files={'photo': f}
    )
    
analysis = response.json()['analysis']
print(f"Overall Score: {analysis['overall_score']}")
```

### Node.js Client (Backend Integration)

```javascript
const mlAnalysis = require('./controllers/mlAnalysisController');

// Analyze uploaded photo
const analysis = await mlAnalysis.analyzePhoto(
    '/path/to/photo.jpg',
    { includeQuality: true }
);

console.log('Body Fat:', analysis.body_fat_estimate);
console.log('Muscle Score:', analysis.muscle_score);
```

### cURL

```bash
# Analyze photo
curl -X POST http://localhost:5001/api/ml/analyze \
  -F "photo=@progress_photo.jpg"

# Health check
curl http://localhost:5001/health
```

## Error Handling

The service includes comprehensive error handling:

- **400 Bad Request**: Invalid file type, missing parameters
- **413 Payload Too Large**: File exceeds 10MB
- **500 Internal Server Error**: Model inference failure
- **503 Service Unavailable**: Model not loaded

Example error response:
```json
{
  "success": false,
  "error": "Invalid file type. Allowed: png, jpg, jpeg, webp, gif"
}
```

## Security Considerations

1. **File Size Limit**: 10MB maximum per file
2. **File Type Validation**: Only image formats allowed
3. **CORS**: Configured for Node.js backend only
4. **Rate Limiting**: Recommended in production
5. **Input Sanitization**: All images preprocessed before inference

## Monitoring & Logs

### Health Checks

Docker healthcheck runs every 30 seconds:
```bash
docker ps --filter "name=ml-service"
```

### Logs

View service logs:
```bash
docker logs fitflow-ml-service -f
```

Log format includes:
- Request timestamps
- Inference times
- Error stack traces
- Model loading status

## CI/CD Integration

### GitHub Actions Workflow

```yaml
- name: Test ML Service
  run: |
    cd ml-service
    pip install -r requirements.txt
    pytest --cov=src
```

### Pre-deployment Checks

1. ✅ All tests passing
2. ✅ Coverage > 90%
3. ✅ Docker image builds successfully
4. ✅ Health endpoint responds
5. ✅ Model loads without errors

## Troubleshooting

### Common Issues

**Issue**: Service starts but health check fails
```bash
# Check if model loaded successfully
docker logs fitflow-ml-service | grep "ML model ready"
```

**Issue**: Slow inference times
- Check CPU allocation
- Reduce batch size
- Use GPU-enabled TensorFlow (optional)

**Issue**: Out of memory errors
```bash
# Increase Docker memory limit
docker run -m 2g fitflow-ml-service
```

## Contributing

When adding new features:

1. Update model in `src/photoAnalyzer.py`
2. Add API endpoint in `src/app.py`
3. Write tests in `tests/`
4. Update this README
5. Update Node.js controller if needed

## License

Part of FitFlow project. See main repository LICENSE.

## Contact

For questions or issues, refer to the main FitFlow repository.
