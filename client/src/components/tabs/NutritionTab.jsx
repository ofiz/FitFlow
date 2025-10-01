import React, { useState, useEffect } from 'react';
import { Apple, Plus } from 'lucide-react';
import { nutritionAPI } from '../../utils/api';
import AddMealModal from '../modals/AddMealModal';
import EditMealModal from '../modals/EditMealModal';
import DateFilter from '../common/DateFilter';
import '../../styles/tabs/NutritionTab.css';

const NutritionTab = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [period, setPeriod] = useState('today');

  useEffect(() => {
    fetchMeals();
  }, [period]);

  const fetchMeals = async () => {
    try {
      const data = await nutritionAPI.getToday(period);
      setMeals(data);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMeal = async (mealData) => {
    try {
      await nutritionAPI.addMeal(mealData);
      setIsModalOpen(false);
      fetchMeals();
      alert('Meal added successfully!');
    } catch (error) {
      console.error('Error adding meal:', error);
      alert('Failed to add meal. Please try again.');
    }
  };

  const handleEditMeal = (meal) => {
    setEditingMeal(meal);
  };

  const handleSaveEdit = async (updates) => {
    try {
      await nutritionAPI.updateMeal(editingMeal._id, updates);
      setEditingMeal(null);
      fetchMeals();
    } catch (error) {
      console.error('Error updating meal:', error);
      alert('Failed to update meal');
    }
  };

  const handleDeleteMeal = async (mealId) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      try {
        await nutritionAPI.deleteMeal(mealId);
        fetchMeals();
      } catch (error) {
        console.error('Error deleting meal:', error);
        alert('Failed to delete meal');
      }
    }
  };

  const calculateMacros = () => {
    const totals = meals.reduce((acc, meal) => ({
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fats: acc.fats + (meal.fats || 0)
    }), { protein: 0, carbs: 0, fats: 0 });

    return totals;
  };

  const macros = calculateMacros();

  if (loading) {
    return (
      <div className="nutrition-tab">
        <p>Loading meals...</p>
      </div>
    );
  }

  return (
    <div className="nutrition-tab">
      <div className="tab-header">
        <h1 className="tab-title gradient-green-emerald">
          Nutrition Tracker
        </h1>
        <p className="tab-subtitle">Track your daily meals and macros</p>
      </div>

      <button className="add-meal-btn" onClick={() => setIsModalOpen(true)}>
        <Plus size={20} />
        Add Meal
      </button>

      <DateFilter selected={period} onChange={setPeriod} />
      
      <div className="nutrition-grid">
        <div className="nutrition-card">
          <h3 className="card-title">Today's Meals</h3>
          <div className="meals-list">
            {meals.length > 0 ? (
              meals.map((meal) => (
                <MealEntry 
                  key={meal._id}
                  meal={meal}
                  mealType={meal.mealType}
                  name={meal.name}
                  calories={meal.calories}
                  time={meal.time}
                  onEdit={handleEditMeal}
                  onDelete={handleDeleteMeal}
                />
              ))
            ) : (
              <div className="empty-meals">
                <Apple size={48} className="empty-icon" />
                <p>No meals logged today</p>
              </div>
            )}
          </div>
        </div>

        <div className="nutrition-card">
          <h3 className="card-title">Macros Breakdown</h3>
          <div className="macros-list">
            <MacroBar label="Protein" value={macros.protein} max={150} color="red" />
            <MacroBar label="Carbs" value={macros.carbs} max={250} color="yellow" />
            <MacroBar label="Fats" value={macros.fats} max={70} color="blue" />
          </div>
        </div>
      </div>

      <AddMealModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMeal}
      />

      <EditMealModal 
        isOpen={!!editingMeal}
        onClose={() => setEditingMeal(null)}
        onSave={handleSaveEdit}
        meal={editingMeal}
      />
    </div>
  );
};

const MealEntry = ({ meal, mealType, name, calories, time, onEdit, onDelete }) => (
  <div className="meal-entry">
    <div className="meal-info">
      <h4 className="meal-name">{mealType}</h4>
      <p className="meal-time">{name} - {time}</p>
    </div>
    <div className="meal-actions-group">
      <div className="meal-calories">
        <p className="calories-value">{calories} cal</p>
      </div>
      <div className="meal-actions">
        <button onClick={() => onEdit(meal)} className="icon-btn" title="Edit">✏️</button>
        <button onClick={() => onDelete(meal._id)} className="icon-btn delete" title="Delete">🗑️</button>
      </div>
    </div>
  </div>
);

const MacroBar = ({ label, value, max, color }) => (
  <div className="macro-bar">
    <div className="macro-header">
      <span className="macro-label">{label}</span>
      <span className="macro-values">{value}g / {max}g</span>
    </div>
    <div className="macro-progress">
      <div 
        className={`macro-fill macro-${color}`} 
        style={{ width: `${Math.min((value/max)*100, 100)}%` }}
      />
    </div>
  </div>
);

export default NutritionTab;