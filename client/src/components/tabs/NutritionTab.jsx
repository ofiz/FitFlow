import React, { useState, useEffect } from 'react';
import { Apple, Plus } from 'lucide-react';
import { nutritionAPI } from '../../utils/api';
import AddMealModal from '../modals/AddMealModal';
import '../../styles/tabs/NutritionTab.css';

const NutritionTab = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const data = await nutritionAPI.getToday();
      setMeals(data);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle saving new meal
  const handleSaveMeal = async (mealData) => {
    try {
      console.log('Sending meal data:', mealData);
      
      // Call API to create meal
      await nutritionAPI.addMeal(mealData);
      
      // Close modal
      setIsModalOpen(false);
      
      // Refresh meals list
      fetchMeals();
      
      // Success message
      alert('Meal added successfully!');
    } catch (error) {
      console.error('Error adding meal:', error);
      alert('Failed to add meal. Please try again.');
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
          Nutrition Tracker 🍎
        </h1>
        <p className="tab-subtitle">Track your daily meals and macros</p>
      </div>

      {/* Add Meal Button */}
      <button className="add-meal-btn" onClick={() => setIsModalOpen(true)}>
        <Plus size={20} />
        Add Meal
      </button>

      <div className="nutrition-grid">
        <div className="nutrition-card">
          <h3 className="card-title">Today's Meals</h3>
          <div className="meals-list">
            {meals.length > 0 ? (
              meals.map((meal) => (
                <MealEntry 
                  key={meal._id}
                  meal={meal.mealType}
                  name={meal.name}
                  calories={meal.calories}
                  time={meal.time}
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

      {/* Modal Component */}
      <AddMealModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMeal}
      />
    </div>
  );
};

const MealEntry = ({ meal, name, calories, time }) => (
  <div className="meal-entry">
    <div className="meal-info">
      <h4 className="meal-name">{meal}</h4>
      <p className="meal-time">{name} - {time}</p>
    </div>
    <div className="meal-calories">
      <p className="calories-value">{calories} cal</p>
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