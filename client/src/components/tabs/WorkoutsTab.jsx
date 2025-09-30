import React, { useState, useEffect } from 'react';
import { Dumbbell, Plus } from 'lucide-react';
import { workoutsAPI } from '../../utils/api';
import AddWorkoutModal from '../modals/AddWorkoutModal';
import '../../styles/tabs/WorkoutsTab.css';

const WorkoutsTab = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const data = await workoutsAPI.getAll();
      setWorkouts(data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle saving new workout
  const handleSaveWorkout = async (workoutData) => {
    try {
      // Call API to create workout
      await workoutsAPI.create(workoutData);
      
      // Close modal
      setIsModalOpen(false);
      
      // Refresh workouts list
      fetchWorkouts();
      
      // Optional: show success message
      alert('Workout added successfully!');
    } catch (error) {
      console.error('Error adding workout:', error);
      alert('Failed to add workout. Please try again.');
    }
  };

  return (
    <div className="workouts-tab">
      <div className="tab-header">
        <h1 className="tab-title gradient-orange-red">
          Workout Programs 💪
        </h1>
        <p className="tab-subtitle">
          {workouts.length > 0 
            ? 'Your workout history' 
            : 'No workouts yet - start your first one!'}
        </p>
      </div>

      {/* Add Workout Button */}
      <button className="add-workout-btn" onClick={() => setIsModalOpen(true)}>
        <Plus size={20} />
        Add Workout
      </button>

      <div className="workouts-grid">
        {workouts.length > 0 ? (
          workouts.map((workout) => (
            <WorkoutCard 
              key={workout._id}
              title={workout.title}
              exercises={workout.exercises?.length || 0}
              duration={`${workout.duration} min`}
              difficulty={workout.difficulty}
              date={new Date(workout.date).toLocaleDateString()}
            />
          ))
        ) : (
          <div className="empty-state">
            <Dumbbell size={64} className="empty-icon" />
            <p>No workouts recorded yet</p>
            <p className="empty-subtitle">Start tracking your fitness journey!</p>
          </div>
        )}
      </div>

      {/* Modal Component */}
      <AddWorkoutModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWorkout}
      />
    </div>
  );
};

const WorkoutCard = ({ title, exercises, duration, difficulty, date }) => (
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
    <p className="workout-date">{date}</p>
  </div>
);

export default WorkoutsTab;