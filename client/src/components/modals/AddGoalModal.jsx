import React, { useState } from 'react';
import { X } from 'lucide-react';
import '../../styles/modals/AddGoalModal.css';

const AddGoalModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    current: '',
    target: '',
    unit: '',
    category: 'other'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Add initial field that equals current
    const goalData = {
      ...formData,
      initial: parseFloat(formData.current)
    };
    
    onSave(goalData);

    // Reset form
    setFormData({
      title: '',
      current: '',
      target: '',
      unit: '',
      category: 'other'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Goal</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Goal Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Lose 5kg"
              required
            />
          </div>

          <div className="form-group">
            <label>Starting Value *</label>
            <input
              type="number"
              name="current"
              value={formData.current}
              onChange={handleChange}
              placeholder="75"
              step="0.1"
              required
            />
            <small style={{
              display: 'block',
              marginTop: '4px',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '12px'
            }}>
              Your current weight/value (this will be tracked)
            </small>
          </div>

          <div className="form-group">
            <label>Target Value *</label>
            <input
              type="number"
              name="target"
              value={formData.target}
              onChange={handleChange}
              placeholder="70"
              step="0.1"
              required
            />
          </div>

          <div className="form-group">
            <label>Unit *</label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              placeholder="kg, days, reps, etc."
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="weight">Weight</option>
              <option value="strength">Strength</option>
              <option value="endurance">Endurance</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button type="submit" className="submit-btn">
            Save Goal
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddGoalModal;