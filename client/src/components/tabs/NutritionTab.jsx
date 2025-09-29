import React from 'react';
import { Apple } from 'lucide-react';
import '../../styles/tabs/NutritionTab.css';

const NutritionTab = () => {
  return (
    <div className="nutrition-tab">
      <div className="tab-header">
        <h1 className="tab-title gradient-green-emerald">
          Nutrition Tracker 🍎
        </h1>
        <p className="tab-subtitle">Track your daily meals and macros</p>
      </div>

      <div className="nutrition-grid">
        <div className="nutrition-card">
          <h3 className="card-title">Today's Meals</h3>
          <div className="meals-list">
            <MealEntry meal="Breakfast" calories={450} time="8:00 AM" />
            <MealEntry meal="Lunch" calories={650} time="1:00 PM" />
            <MealEntry meal="Snack" calories={200} time="4:00 PM" />
            <MealEntry meal="Dinner" calories={550} time="7:00 PM" />
          </div>
        </div>

        <div className="nutrition-card">
          <h3 className="card-title">Macros Breakdown</h3>
          <div className="macros-list">
            <MacroBar label="Protein" value={120} max={150} color="red" />
            <MacroBar label="Carbs" value={180} max={250} color="yellow" />
            <MacroBar label="Fats" value={50} max={70} color="blue" />
          </div>
        </div>
      </div>
    </div>
  );
};

const MealEntry = ({ meal, calories, time }) => (
  <div className="meal-entry">
    <div className="meal-info">
      <h4 className="meal-name">{meal}</h4>
      <p className="meal-time">{time}</p>
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
        style={{ width: `${(value/max)*100}%` }}
      />
    </div>
  </div>
);

export default NutritionTab;