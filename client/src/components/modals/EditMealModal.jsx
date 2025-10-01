import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import '../../styles/modals/AddMealModal.css';

const EditMealModal = ({ isOpen, onClose, onSave, meal }) => {
  const [formData, setFormData] = useState({
    name: '',
    mealType: 'Breakfast',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    time: ''
  });

  useEffect(() => {
    if (meal) {
      setFormData({
        name: meal.name,
        mealType: meal.mealType,
        calories: meal.calories,
        protein: meal.protein || '',
        carbs: meal.carbs || '',
        fats: meal.fats || '',
        time: meal.time
      });
    }
  }, [meal]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
          <h2>Edit Meal</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Meal Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Chicken Salad"
              required
            />
          </div>

          <div className="form-group">
            <label>Meal Type *</label>
            <select
              name="mealType"
              value={formData.mealType}
              onChange={handleChange}
              required
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack</option>
            </select>
          </div>

          <div className="form-group">
            <label>Time *</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Calories *</label>
            <input
              type="number"
              name="calories"
              value={formData.calories}
              onChange={handleChange}
              placeholder="500"
              required
            />
          </div>

          <div className="macros-row">
            <div className="form-group">
              <label>Protein (g)</label>
              <input
                type="number"
                name="protein"
                value={formData.protein}
                onChange={handleChange}
                placeholder="30"
              />
            </div>

            <div className="form-group">
              <label>Carbs (g)</label>
              <input
                type="number"
                name="carbs"
                value={formData.carbs}
                onChange={handleChange}
                placeholder="50"
              />
            </div>

            <div className="form-group">
              <label>Fats (g)</label>
              <input
                type="number"
                name="fats"
                value={formData.fats}
                onChange={handleChange}
                placeholder="15"
              />
            </div>
          </div>

          <button type="submit" className="submit-btn">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditMealModal;