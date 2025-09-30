import React from 'react';
import { Target } from 'lucide-react';
import '../../styles/tabs/GoalsTab.css';

const GoalsTab = () => {
  return (
    <div className="goals-tab">
      <div className="tab-header">
        <h1 className="tab-title gradient-yellow-orange">
          Fitness Goals 🎯
        </h1>
        <p className="tab-subtitle">Set and track your fitness milestones</p>
      </div>

      <div className="goals-list">
        <GoalCard goal="Lose 5kg" current={2} target={5} unit="kg" color="yellow" />
        <GoalCard goal="Bench Press 100kg" current={85} target={100} unit="kg" color="orange" />
        <GoalCard goal="Run 5km in 25min" current={28} target={25} unit="min" reverse color="red" />
        <GoalCard goal="Workout 5x per week" current={3} target={5} unit="days" color="green" />
      </div>
    </div>
  );
};

const GoalCard = ({ goal, current, target, unit, color, reverse }) => {
  const progress = reverse 
    ? ((target / current) * 100)
    : ((current / target) * 100);
    
  return (
    <div className="goal-card">
      <div className="goal-header">
        <h3 className="goal-title">{goal}</h3>
        <span className="goal-progress-text">
          {current}/{target} {unit}
        </span>
      </div>
      <div className="goal-progress-bar">
        <div 
          className={`goal-progress-fill goal-${color}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default GoalsTab;