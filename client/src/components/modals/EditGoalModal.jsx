import React, { useState, useEffect } from 'react';
import '../../styles/modals/AddGoalModal.css';

const EditGoalModal = ({ isOpen, onClose, onSave, goal }) => {
  const [formData, setFormData] = useState({
    title: '',
    current: '',
    target: '',
    unit: 'kg'
  });

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title,
        current: goal.current,
        target: goal.target,
        unit: goal.unit
      });
    }
  }, [goal]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'current' || name === 'target' ? parseFloat(value) || '' : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Goal</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Goal Title</label>
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
            <label>Current Value</label>
            <input
              type="number"
              name="current"
              value={formData.current}
              onChange={handleChange}
              placeholder="54"
              step="0.1"
              required
            />
          </div>

          <div className="form-group">
            <label>Target Value</label>
            <input
              type="number"
              name="target"
              value={formData.target}
              onChange={handleChange}
              placeholder="49"
              step="0.1"
              required
            />
          </div>

          <div className="form-group">
            <label>Unit</label>
            <select name="unit" value={formData.unit} onChange={handleChange}>
              <option value="kg">Kilograms (kg)</option>
              <option value="lbs">Pounds (lbs)</option>
              <option value="reps">Repetitions</option>
              <option value="minutes">Minutes</option>
              <option value="km">Kilometers</option>
              <option value="days">Days</option>
            </select>
          </div>

          <button type="submit" className="submit-btn">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditGoalModal;