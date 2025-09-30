import React from 'react';
import { Camera, Plus } from 'lucide-react';
import '../../styles/tabs/ProgressTab.css';

const ProgressTab = () => {
  return (
    <div className="progress-tab">
      <div className="tab-header">
        <h1 className="tab-title gradient-blue-cyan">
          Progress Gallery 📸
        </h1>
        <p className="tab-subtitle">Track your transformation journey</p>
      </div>

      <div className="progress-grid">
        <button className="add-photo-card">
          <Plus size={48} />
          <p>Upload New Photo</p>
        </button>
        
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="photo-card">
            <Camera size={48} />
            <p className="photo-date">Week {i}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressTab;