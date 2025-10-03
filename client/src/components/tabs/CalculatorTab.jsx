import React, { useState, useEffect } from 'react';
import { Calculator, History, Trash2 } from 'lucide-react';
import { calculatorAPI } from '../../utils/api';
import '../../styles/tabs/CalculatorTab.css';

const CalculatorTab = () => {
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    gender: 'male',
    activityLevel: 'moderately',
    generalGoal: 'maintenance'
  });
  
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await calculatorAPI.getHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await calculatorAPI.calculate({
        age: Number(formData.age),
        weight: Number(formData.weight),
        height: Number(formData.height),
        gender: formData.gender,
        activityLevel: formData.activityLevel,
        generalGoal: formData.generalGoal
      });
      
      setResult(data);
      loadHistory(); // Refresh history after new calculation
    } catch (err) {
      setError(err.message || 'Failed to calculate');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const activityLevelLabels = {
    sedentary: 'Sedentary',
    lightly: 'Lightly Active',
    moderately: 'Moderately Active',
    very: 'Very Active',
    extremely: 'Extremely Active'
  };

  const generalGoalLabels = {
    maintenance: 'Maintenance',
    gain_mass: 'Gain Mass',
    lose_fat: 'Lose Fat'
  };

  return (
    <div className="calculator-tab">
      <div className="tab-header">
        <h1 className="tab-title gradient-red-pink">
          Calorie Calculator
        </h1>
        <p className="tab-subtitle">Calculate your daily calorie needs</p>
      </div>

      <div className="calculator-container">
        <form className="calculator-form" onSubmit={handleCalculate}>
          <InputField 
            label="Age" 
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="25" 
            type="number"
            required
          />
          <InputField 
            label="Weight (kg)" 
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            placeholder="75" 
            type="number"
            required
          />
          <InputField 
            label="Height (cm)" 
            name="height"
            value={formData.height}
            onChange={handleChange}
            placeholder="175" 
            type="number"
            required
          />
          
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select 
              className="form-select"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Activity Level</label>
            <select 
              className="form-select"
              name="activityLevel"
              value={formData.activityLevel}
              onChange={handleChange}
            >
              <option value="sedentary">Sedentary (little or no exercise)</option>
              <option value="lightly">Lightly Active (1-3 days/week)</option>
              <option value="moderately">Moderately Active (3-5 days/week)</option>
              <option value="very">Very Active (6-7 days/week)</option>
              <option value="extremely">Extremely Active (athlete)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">General Goal</label>
            <select 
              className="form-select"
              name="generalGoal"
              value={formData.generalGoal}
              onChange={handleChange}
            >
              <option value="maintenance">Maintenance</option>
              <option value="gain_mass">Gain Mass</option>
              <option value="lose_fat">Lose Fat</option>
            </select>
          </div>

          {error && (
            <div style={{ 
              color: '#ef4444', 
              padding: '12px', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <button className="calculate-btn" type="submit" disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate'}
          </button>
        </form>

        {result && (
          <div className="result-card">
            <h3>Your Results</h3>
            <div className="result-item">
              <span>BMR (Basal Metabolic Rate):</span>
              <strong>{result.bmr} cal/day</strong>
            </div>
            <div className="result-item">
              <span>TDEE (Total Daily Energy):</span>
              <strong>{result.tdee} cal/day</strong>
            </div>
            <p style={{ 
              marginTop: '16px', 
              fontSize: '13px', 
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: '1.5'
            }}>
              Your BMR is the calories your body burns at rest. Your TDEE includes your activity level. These are estimates - listen to your body and consult a healthcare provider for personalized advice.
            </p>
          </div>
        )}

        {history.length > 0 && (
          <div className="history-section">
            <button 
              className="history-toggle"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History size={18} />
              {showHistory ? 'Hide' : 'Show'} Calculation History ({history.length})
            </button>

            {showHistory && (
              <div className="history-list">
                {history.map((calc) => (
                  <div key={calc._id} className="history-item">
                    <div className="history-info">
                      <div className="history-date">{formatDate(calc.createdAt)}</div>
                      <div className="history-details">
                        Age: {calc.age} | Weight: {calc.weight}kg | Height: {calc.height}cm | 
                        {calc.gender === 'male' ? ' Male' : ' Female'} | 
                        {activityLevelLabels[calc.activityLevel]}
                        {calc.generalGoal && ` | ${generalGoalLabels[calc.generalGoal]}`}
                      </div>
                      <div className="history-results">
                        <span>BMR: <strong>{calc.bmr}</strong></span>
                        <span>TDEE: <strong>{calc.tdee}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, placeholder, type = "text", required }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <input 
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="form-input"
      required={required}
    />
  </div>
);

export default CalculatorTab;