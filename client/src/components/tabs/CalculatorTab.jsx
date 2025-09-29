import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import '../../styles/tabs/CalculatorTab.css';

const CalculatorTab = () => {
  const [result, setResult] = useState(null);

  return (
    <div className="calculator-tab">
      <div className="tab-header">
        <h1 className="tab-title gradient-red-pink">
          Calorie Calculator 🔥
        </h1>
        <p className="tab-subtitle">Calculate your daily calorie needs</p>
      </div>

      <div className="calculator-container">
        <div className="calculator-form">
          <InputField label="Age" placeholder="25" type="number" />
          <InputField label="Weight (kg)" placeholder="75" type="number" />
          <InputField label="Height (cm)" placeholder="175" type="number" />
          
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select className="form-select">
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Activity Level</label>
            <select className="form-select">
              <option>Sedentary (little or no exercise)</option>
              <option>Lightly Active (1-3 days/week)</option>
              <option>Moderately Active (3-5 days/week)</option>
              <option>Very Active (6-7 days/week)</option>
              <option>Extremely Active (athlete)</option>
            </select>
          </div>

          <button className="calculate-btn">
            Calculate
          </button>
        </div>

        {result && (
          <div className="result-card">
            <h3>Your Results</h3>
            <div className="result-item">
              <span>BMR:</span>
              <strong>1,850 cal/day</strong>
            </div>
            <div className="result-item">
              <span>TDEE:</span>
              <strong>2,570 cal/day</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InputField = ({ label, placeholder, type = "text" }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <input 
      type={type}
      placeholder={placeholder}
      className="form-input"
    />
  </div>
);

export default CalculatorTab;