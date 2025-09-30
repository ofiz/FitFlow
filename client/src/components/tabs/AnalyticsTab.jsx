import React from 'react';
import { TrendingUp, Activity } from 'lucide-react';
import '../../styles/tabs/AnalyticsTab.css';

const AnalyticsTab = () => {
  return (
    <div className="analytics-tab">
      <div className="tab-header">
        <h1 className="tab-title gradient-teal-green">
          Analytics & Stats 📊
        </h1>
        <p className="tab-subtitle">Track your progress with detailed insights</p>
      </div>

      <div className="analytics-grid">
        <div className="chart-card">
          <h3 className="chart-title">Weight Progress</h3>
          <div className="chart-placeholder">
            <TrendingUp size={64} />
            <p>Chart visualization</p>
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Workout Frequency</h3>
          <div className="chart-placeholder">
            <Activity size={64} />
            <p>Chart visualization</p>
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Calorie Intake</h3>
          <div className="chart-placeholder">
            <TrendingUp size={64} />
            <p>Chart visualization</p>
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Body Measurements</h3>
          <div className="chart-placeholder">
            <Activity size={64} />
            <p>Chart visualization</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;