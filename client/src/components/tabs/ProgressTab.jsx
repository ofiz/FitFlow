import React, { useState, useEffect, useRef } from 'react';
import { Camera, Plus, Trash2, Loader, Brain, TrendingUp, Activity, Award } from 'lucide-react';
import '../../styles/tabs/ProgressTab.css';

const ProgressTab = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    weight: '',
    height: '',
    age: '',
    gender: 'male',
    notes: ''
  });
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch photos on component mount
  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/progress/photos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch photos');
      }

      const data = await response.json();
      setPhotos(data.photos);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setShowUploadModal(true);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('photo', selectedFile);
      
      // Add optional body metrics
      if (uploadForm.weight) formData.append('weight', uploadForm.weight);
      if (uploadForm.height) formData.append('height', uploadForm.height);
      if (uploadForm.age) formData.append('age', uploadForm.age);
      formData.append('gender', uploadForm.gender);
      if (uploadForm.notes) formData.append('notes', uploadForm.notes);

      const response = await fetch('/api/progress/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload photo');
      }

      const data = await response.json();
      console.log('Uploaded photo response:', data.photo);
      console.log('AI Analysis:', data.photo.aiAnalysis);
      
      // Refresh photos list
      await fetchPhotos();
      
      // Reset form and close modal
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadForm({
        weight: '',
        height: '',
        age: '',
        gender: 'male',
        notes: ''
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err.message);
      console.error('Error uploading photo:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/progress/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }

      // Remove photo from list
      setPhotos(prevPhotos => prevPhotos.filter(p => p._id !== photoId));
    } catch (err) {
      setError(err.message);
      console.error('Error deleting photo:', err);
    }
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
  };

  const getImageUrl = (imageUrl) => {
    return imageUrl;
  };

  return (
    <div className="progress-tab">
      <div className="tab-header">
        <h1 className="tab-title gradient-blue-cyan">
          Progress Gallery 📸
        </h1>
        <p className="tab-subtitle">Track your transformation journey</p>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <div className="progress-grid">
        <button 
          className="add-photo-card"
          onClick={handleFileSelect}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader size={48} className="spinning" />
              <p>Uploading...</p>
            </>
          ) : (
            <>
              <Plus size={48} />
              <p>Upload New Photo</p>
            </>
          )}
        </button>
        
        {loading ? (
          <div className="loading-container">
            <Loader size={48} className="spinning" />
            <p>Loading photos...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="empty-state">
            <Camera size={64} />
            <p>No photos yet. Start your journey by uploading your first photo!</p>
          </div>
        ) : (
          photos.map((photo) => (
            <div key={photo._id} className="photo-card">
              <div className="photo-content">
                <img 
                  src={getImageUrl(photo.imageUrl)} 
                  alt={new Date(photo.date).toLocaleDateString('en-GB')}
                  className="progress-photo"
                  onClick={() => handlePhotoClick(photo)}
                  style={{ cursor: 'pointer' }}
                />
                <button 
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePhoto(photo._id);
                  }}
                  title="Delete photo"
                >
                  <Trash2 size={32} />
                </button>
              </div>
              <div className="photo-info">
                <p className="photo-date">
                  {new Date(photo.date).toLocaleDateString('en-GB')}
                </p>
                
                {/* AI Analysis Results */}
                {photo.aiAnalysis && (
                  <div className="ai-analysis-preview">
                    <div className="ai-badge">
                      <Brain size={14} />
                      <span>AI Analyzed</span>
                    </div>
                    <div className="analysis-scores">
                      <div className="score-item" title="Overall Progress Score">
                        <Award size={16} className="score-icon" />
                        <span className="score-value">{Math.round(photo.aiAnalysis.overallScore)}</span>
                      </div>
                      <div className="score-item" title="Muscle Score">
                        <Activity size={16} className="score-icon" />
                        <span className="score-value">{Math.round(photo.aiAnalysis.muscleScore)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedPhoto && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content-ai" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ✕
            </button>
            
            <div className="modal-layout">
              {/* Left side - Image */}
              <div className="modal-image-section">
                <img 
                  src={getImageUrl(selectedPhoto.imageUrl)} 
                  alt={new Date(selectedPhoto.date).toLocaleDateString('en-GB')}
                  className="modal-image"
                />
                <p className="modal-date">
                  📅 {new Date(selectedPhoto.date).toLocaleDateString('en-GB')}
                </p>
                {selectedPhoto.weight && (
                  <p className="modal-weight">⚖️ {selectedPhoto.weight} kg</p>
                )}
                {selectedPhoto.notes && (
                  <p className="modal-notes">📝 {selectedPhoto.notes}</p>
                )}
              </div>

              {/* Right side - AI Analysis */}
              {selectedPhoto.aiAnalysis && (
                <div className="modal-analysis-section">
                  <h3 className="analysis-title">
                    <Brain size={24} />
                    AI Analysis Results
                  </h3>

                  {/* Overall Score */}
                  <div className="analysis-card overall-score">
                    <div className="score-header">
                      <Award size={32} className="score-icon-large" />
                      <div>
                        <h4>Overall Progress Score</h4>
                        <p className="score-subtitle">Combined fitness metric</p>
                      </div>
                    </div>
                    <div className="score-display">
                      <span className="score-number">{Math.round(selectedPhoto.aiAnalysis.overallScore)}</span>
                      <span className="score-max">/100</span>
                    </div>
                    <div className="score-bar">
                      <div 
                        className="score-bar-fill"
                        style={{ width: `${selectedPhoto.aiAnalysis.overallScore}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Detailed Metrics */}
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <div className="metric-header">
                        <Activity size={20} />
                        <span>Muscle Definition</span>
                      </div>
                      <div className="metric-value">
                        {Math.round(selectedPhoto.aiAnalysis.muscleScore)}
                        <span className="metric-unit">/100</span>
                      </div>
                      <div className="metric-bar">
                        <div 
                          className="metric-bar-fill muscle"
                          style={{ width: `${selectedPhoto.aiAnalysis.muscleScore}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="metric-card">
                      <div className="metric-header">
                        <TrendingUp size={20} />
                        <span>Body Fat Estimate</span>
                      </div>
                      <div className="metric-value">
                        {Math.round(selectedPhoto.aiAnalysis.bodyFatEstimate)}
                        <span className="metric-unit">%</span>
                      </div>
                      <div className="metric-bar">
                        <div 
                          className="metric-bar-fill bodyfat"
                          style={{ width: `${selectedPhoto.aiAnalysis.bodyFatEstimate}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="metric-card">
                      <div className="metric-header">
                        <Camera size={20} />
                        <span>Posture Quality</span>
                      </div>
                      <div className="metric-value">
                        {Math.round(selectedPhoto.aiAnalysis.postureScore)}
                        <span className="metric-unit">/100</span>
                      </div>
                      <div className="metric-bar">
                        <div 
                          className="metric-bar-fill posture"
                          style={{ width: `${selectedPhoto.aiAnalysis.postureScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Model Info */}
                  <div className="model-info">
                    {selectedPhoto.aiAnalysis.bmi && (
                      <p className="info-item">
                        <strong>BMI:</strong> {selectedPhoto.aiAnalysis.bmi}
                      </p>
                    )}
                    <p className="info-item">
                      <strong>Confidence:</strong> {Math.round(selectedPhoto.aiAnalysis.confidence * 100)}%
                    </p>
                    <p className="info-item">
                      <strong>Method:</strong> {selectedPhoto.aiAnalysis.modelType || 'MobileNetV2'}
                    </p>
                    {selectedPhoto.aiAnalysis.analyzedAt && (
                      <p className="info-item">
                        <strong>Analyzed:</strong> {new Date(selectedPhoto.aiAnalysis.analyzedAt).toLocaleString('en-GB')}
                      </p>
                    )}
                    {(selectedPhoto.weight || selectedPhoto.height) && (
                      <div className="body-metrics">
                        <p className="info-item">
                          <strong>⚖️ Weight:</strong> {selectedPhoto.weight} kg
                        </p>
                        <p className="info-item">
                          <strong>📏 Height:</strong> {selectedPhoto.height} cm
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Photo Quality Metrics */}
                  {selectedPhoto.aiAnalysis.poseQuality && (
                    <div className="quality-metrics">
                      <h4>Photo Quality</h4>
                      <div className="quality-grid">
                        <div className="quality-item">
                          <span className="quality-label">Clarity</span>
                          <span className="quality-value">{Math.round(selectedPhoto.aiAnalysis.poseQuality.edgeClarity)}%</span>
                        </div>
                        <div className="quality-item">
                          <span className="quality-label">Lighting</span>
                          <span className="quality-value">{Math.round(selectedPhoto.aiAnalysis.poseQuality.brightness)}%</span>
                        </div>
                        <div className="quality-item">
                          <span className="quality-label">Contrast</span>
                          <span className="quality-value">{Math.round(selectedPhoto.aiAnalysis.poseQuality.contrast)}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content-upload" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowUploadModal(false)}>
              ✕
            </button>
            
            <h2>📸 Upload Progress Photo</h2>
            <p className="upload-subtitle">Add your body metrics for accurate AI analysis</p>
            
            <form onSubmit={handleUploadSubmit} className="upload-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="weight">
                    ⚖️ Weight (kg) *
                  </label>
                  <input
                    type="number"
                    id="weight"
                    step="0.1"
                    min="20"
                    max="300"
                    value={uploadForm.weight}
                    onChange={(e) => setUploadForm({...uploadForm, weight: e.target.value})}
                    placeholder="75.5"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="height">
                    📏 Height (cm) *
                  </label>
                  <input
                    type="number"
                    id="height"
                    step="0.1"
                    min="100"
                    max="250"
                    value={uploadForm.height}
                    onChange={(e) => setUploadForm({...uploadForm, height: e.target.value})}
                    placeholder="175"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="age">
                    🎂 Age (optional)
                  </label>
                  <input
                    type="number"
                    id="age"
                    min="10"
                    max="120"
                    value={uploadForm.age}
                    onChange={(e) => setUploadForm({...uploadForm, age: e.target.value})}
                    placeholder="25"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="gender">
                    👤 Gender
                  </label>
                  <select
                    id="gender"
                    value={uploadForm.gender}
                    onChange={(e) => setUploadForm({...uploadForm, gender: e.target.value})}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notes">
                  📝 Notes (optional)
                </label>
                <textarea
                  id="notes"
                  rows="3"
                  value={uploadForm.notes}
                  onChange={(e) => setUploadForm({...uploadForm, notes: e.target.value})}
                  placeholder="Feeling strong today! 💪"
                />
              </div>

              <div className="upload-info">
                <p>🧠 AI will analyze your photo using:</p>
                <ul>
                  <li>BMI calculation (Weight + Height)</li>
                  <li>Visual body composition analysis</li>
                  <li>Muscle definition assessment</li>
                </ul>
                <p className="info-note">⚠️ This is an estimate based on your weight and height (BMI) combined with AI visual analysis.</p>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader size={16} className="spinning" />
                      Analyzing...
                    </>
                  ) : (
                    <>Upload & Analyze</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTab;