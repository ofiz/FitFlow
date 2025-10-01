import React, { useState } from 'react';
import { X } from 'lucide-react';
import '../../styles/modals/AddGoalModal.css';

const AddGoalModal = ({ isOpen, onClose, onSave }) => {
    // State to store goal form data
    const [formData, setFormData] = useState({
        title: '',
        current: '',
        target: '',
        unit: '',
        category: 'other'
    });

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
        ...prev,
        [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);

        // Reset form after successful save
        setFormData({
            title: '',
            current: '',
            target: '',
            unit: '',
            category: 'other'
        });
    };

    // Don't render if modal is closed
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="modal-header">
            <h2>Add New Goal</h2>
            <button className="close-btn" onClick={onClose}>
                <X size={24} />
            </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
            {/* Goal title */}
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

            {/* Current value */}
            <div className="form-group">
                <label>Current Value *</label>
                <input
                type="number"
                name="current"
                value={formData.current}
                onChange={handleChange}
                placeholder="75"
                required
                />
            </div>

            {/* Target value */}
            <div className="form-group">
                <label>Target Value *</label>
                <input
                type="number"
                name="target"
                value={formData.target}
                onChange={handleChange}
                placeholder="70"
                required
                />
            </div>

            {/* Unit */}
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

            {/* Category */}
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

            {/* Submit button */}
            <button type="submit" className="submit-btn">
                Save Goal
            </button>
            </form>
        </div>
        </div>
    );
};

export default AddGoalModal;