import React, { useState } from 'react';
import { X } from 'lucide-react';
import '../../styles/modals/AddWorkoutModal.css';

const AddWorkoutModal = ({ isOpen, onClose, onSave }) => {
  // State to store form data
  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    difficulty: 'Intermediate',
    notes: ''
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Update only the changed field, keep the rest
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload
    onSave(formData); // Call parent function with form data
  };

  // Don't render if modal is closed
  if (!isOpen) return null;

  return (
    // Overlay - clicking it closes the modal
    <div className="modal-overlay" onClick={onClose}>
      {/* Modal content - stop click propagation so clicking inside doesn't close */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <h2>Add New Workout</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Title input */}
          <div className="form-group">
            <label>Workout Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Morning Run"
              required
            />
          </div>

          {/* Duration input */}
          <div className="form-group">
            <label>Duration (minutes) *</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="30"
              required
            />
          </div>

          {/* Difficulty select */}
          <div className="form-group">
            <label>Difficulty</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Notes textarea */}
          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any notes..."
              rows="3"
            />
          </div>

          {/* Submit button */}
          <button type="submit" className="submit-btn">
            Save Workout
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddWorkoutModal;