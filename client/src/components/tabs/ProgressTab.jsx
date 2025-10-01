import React, { useState, useEffect, useRef } from 'react';
import { Camera, Plus, Trash2, Loader } from 'lucide-react';
import '../../styles/tabs/ProgressTab.css';

const ProgressTab = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleFileChange = async (e) => {
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

    setUploading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('photo', file);

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
      
      // Add new photo to the list
      setPhotos(prevPhotos => [...prevPhotos, data.photo]);
      
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
              <p className="photo-date">
                {new Date(photo.date).toLocaleDateString('en-GB')}
              </p>
            </div>
          ))
        )}
      </div>

      {selectedPhoto && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ✕
            </button>
            <img 
              src={getImageUrl(selectedPhoto.imageUrl)} 
              alt={new Date(selectedPhoto.date).toLocaleDateString('en-GB')}
              className="modal-image"
            />
            <p className="modal-date">
              {new Date(selectedPhoto.date).toLocaleDateString('en-GB')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTab;