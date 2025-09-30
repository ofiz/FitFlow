import React, { useState, useEffect } from 'react';
import { Target, Plus } from 'lucide-react';
import { goalsAPI } from '../../utils/api';
import AddGoalModal from '../modals/AddGoalModal';
import '../../styles/tabs/GoalsTab.css';

const GoalsTab = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const data = await goalsAPI.getAll();
      setGoals(data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle saving new goal
  const handleSaveGoal = async (goalData) => {
    try {
      console.log('Sending goal data:', goalData);
      
      // Call API to create goal
      await goalsAPI.create(goalData);
      
      // Close modal
      setIsModalOpen(false);
      
      // Refresh goals list
      fetchGoals();
      
      // Success message
      alert('Goal added successfully!');
    } catch (error) {
      console.error('Error adding goal:', error);
      alert('Failed to add goal. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="goals-tab">
        <p>Loading goals...</p>
      </div>
    );
  }

  return (
    <div className="goals-tab">
      <div className="tab-header">
        <h1 className="tab-title gradient-yellow-orange">
          Fitness Goals 🎯
        </h1>
        <p className="tab-subtitle">
          {goals.length > 0 
            ? 'Track your fitness milestones' 
            : 'Set your first fitness goal!'}
        </p>
      </div>

      {/* Add Goal Button */}
      <button className="add-goal-btn" onClick={() => setIsModalOpen(true)}>
        <Plus size={20} />
        Add Goal
      </button>

      <div className="goals-list">
        {goals.length > 0 ? (
          goals.map((goal) => (
            <GoalCard 
              key={goal._id}
              goal={goal.title}
              current={goal.current}
              target={goal.target}
              unit={goal.unit}
              color="yellow"
            />
          ))
        ) : (
          <div className="empty-goals">
            <Target size={64} className="empty-icon" />
            <p>No goals set yet</p>
            <p className="empty-subtitle">Start setting your fitness targets!</p>
          </div>
        )}
      </div>

      {/* Modal Component */}
      <AddGoalModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveGoal}
      />
    </div>
  );
};

const GoalCard = ({ goal, current, target, unit, color }) => {
  const progress = (current / target) * 100;
    
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