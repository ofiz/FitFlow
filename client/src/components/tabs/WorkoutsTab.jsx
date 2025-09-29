import React from 'react';
import { Dumbbell } from 'lucide-react';
import '../../styles/tabs/WorkoutsTab.css';

const WorkoutsTab = () => {
  return (
    <div className="workouts-tab">
      <div className="tab-header">
        <h1 className="tab-title gradient-orange-red">
          Workout Programs 💪
        </h1>
        <p className="tab-subtitle">Choose a workout plan that fits your goals</p>
      </div>

      <div className="workouts-grid">
        <WorkoutCard 
          title="Full Body Strength"
          exercises={12}
          duration="45 min"
          difficulty="Intermediate"
        />
        <WorkoutCard 
          title="Upper Body Focus"
          exercises={10}
          duration="40 min"
          difficulty="Advanced"
        />
        <WorkoutCard 
          title="Leg Day"
          exercises={8}
          duration="35 min"
          difficulty="Beginner"
        />
        <WorkoutCard 
          title="Core & Cardio"
          exercises={15}
          duration="30 min"
          difficulty="Intermediate"
        />
      </div>
    </div>
  );
};

const WorkoutCard = ({ title, exercises, duration, difficulty }) => (
  <div className="workout-card">
    <div className="workout-icon">
      <Dumbbell size={32} />
    </div>
    <h3 className="workout-title">{title}</h3>
    <div className="workout-meta">
      <span>{exercises} exercises</span>
      <span>•</span>
      <span>{duration}</span>
      <span>•</span>
      <span>{difficulty}</span>
    </div>
    <button className="workout-btn">Start Workout</button>
  </div>
);

export default WorkoutsTab;