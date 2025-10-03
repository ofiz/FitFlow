import React, { useState, useEffect } from 'react';
import { Target, Plus } from 'lucide-react';
import { goalsAPI } from '../../utils/api';
import AddGoalModal from '../modals/AddGoalModal';
import EditGoalModal from '../modals/EditGoalModal';
import DateFilter from '../common/DateFilter';
import '../../styles/tabs/GoalsTab.css';

const GoalsTab = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [period, setPeriod] = useState('today');

  useEffect(() => {
    fetchGoals();
  }, [period]);

  const fetchGoals = async () => {
    try {
      const data = await goalsAPI.getAll(period);
      setGoals(data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = async (goalData) => {
    try {
      await goalsAPI.create(goalData);
      setIsModalOpen(false);
      fetchGoals();
      alert('Goal added successfully!');
    } catch (error) {
      console.error('Error adding goal:', error);
      alert('Failed to add goal. Please try again.');
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
  };

  const handleSaveEdit = async (updates) => {
    try {
      await goalsAPI.update(editingGoal._id, updates);
      setEditingGoal(null);
      fetchGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
      alert('Failed to update goal');
    }
  };

  const handleUpdateGoal = async (goalId, updates) => {
    try {
      await goalsAPI.update(goalId, updates);
      fetchGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
      alert('Failed to update goal');
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await goalsAPI.delete(goalId);
        fetchGoals();
      } catch (error) {
        console.error('Error deleting goal:', error);
        alert('Failed to delete goal');
      }
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
          Fitness Goals
        </h1>
        <p className="tab-subtitle">
          {goals.length > 0 
            ? 'Track your fitness milestones' 
            : 'Set your first fitness goal!'}
        </p>
      </div>

      <button className="add-goal-btn" onClick={() => setIsModalOpen(true)}>
        <Plus size={20} />
        Add Goal
      </button>

      <DateFilter selected={period} onChange={setPeriod} />

      <div className="goals-list">
        {goals.length > 0 ? (
          goals.map((goal) => (
            <GoalCard 
              key={goal._id}
              goalId={goal._id}
              goalData={goal}
              goal={goal.title}
              current={goal.current}
              target={goal.target}
              unit={goal.unit}
              color="yellow"
              onUpdate={handleUpdateGoal}
              onDelete={handleDeleteGoal}
              onEdit={handleEditGoal}
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

      <AddGoalModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveGoal}
      />

      <EditGoalModal 
        isOpen={!!editingGoal}
        onClose={() => setEditingGoal(null)}
        onSave={handleSaveEdit}
        goal={editingGoal}
      />
    </div>
  );
};

const GoalCard = ({ goalId, goalData, goal, current, target, unit, color, onUpdate, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newCurrent, setNewCurrent] = useState(current);
  
  const initial = goalData.initial || goalData.current; // fallback למטרות ישנות
  
  // Determine if going up or down
  const isDecreaseGoal = initial > target;
  
  let progress;
  let displayText;
  
  if (isDecreaseGoal) {
    // Weight loss: show how much lost / how much to lose
    const totalToLose = initial - target;
    const alreadyLost = initial - current;
    progress = (alreadyLost / totalToLose) * 100;
    displayText = `${current}/${target} ${unit} (Lost: ${alreadyLost.toFixed(1)} ${unit})`;
  } else {
    // Regular goal: show current / target
    progress = (current / target) * 100;
    displayText = `${current}/${target} ${unit}`;
  }
  
  const handleQuickUpdate = async () => {
    if (newCurrent !== current) {
      await onUpdate(goalId, { current: parseFloat(newCurrent) });
      setIsEditing(false);
    }
  };
    
  return (
    <div className="goal-card">
      <div className="goal-header">
        <h3 className="goal-title">{goal}</h3>
        <div className="goal-actions">
          {isEditing ? (
            <div className="quick-update">
              <input 
                type="number" 
                value={newCurrent}
                onChange={(e) => setNewCurrent(e.target.value)}
                className="progress-input"
                step="0.1"
              />
              <button onClick={handleQuickUpdate} className="save-btn">✓</button>
              <button onClick={() => setIsEditing(false)} className="cancel-btn">✕</button>
            </div>
          ) : (
            <>
              <span className="goal-progress-text">{displayText}</span>
              <button onClick={() => onEdit(goalData)} className="icon-btn" title="Edit Goal">⚙️</button>
              <button onClick={() => setIsEditing(true)} className="icon-btn" title="Quick Update">✏️</button>
              <button onClick={() => onDelete(goalId)} className="icon-btn delete" title="Delete">🗑️</button>
            </>
          )}
        </div>
      </div>
      <div className="goal-progress-bar">
        <div 
          className={`goal-progress-fill goal-${color}`}
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
      <div className="goal-footer">
        <span className="progress-percentage">{Math.round(progress)}% Complete</span>
      </div>
    </div>
  );
};

export default GoalsTab;