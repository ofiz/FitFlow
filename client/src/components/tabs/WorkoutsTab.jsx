import React, { useState, useEffect } from 'react';
import { Dumbbell, Plus } from 'lucide-react';
import { workoutsAPI } from '../../utils/api';
import AddWorkoutModal from '../modals/AddWorkoutModal';
import EditWorkoutModal from '../modals/EditWorkoutModal';
import DateFilter from '../common/DateFilter';
import '../../styles/tabs/WorkoutsTab.css';


const WorkoutsTab = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [period, setPeriod] = useState('today');

  useEffect(() => {
    fetchWorkouts();
  }, [period]);

  const fetchWorkouts = async () => {
    try {
      const data = await workoutsAPI.getAll(period);
      setWorkouts(data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkout = async (workoutData) => {
    try {
      await workoutsAPI.create(workoutData);
      setIsModalOpen(false);
      fetchWorkouts();
      alert('Workout added successfully!');
    } catch (error) {
      console.error('Error adding workout:', error);
      alert('Failed to add workout. Please try again.');
    }
  };

  const handleEditWorkout = (workout) => {
    setEditingWorkout(workout);
  };

  const handleSaveEdit = async (updates) => {
    try {
      await workoutsAPI.update(editingWorkout._id, updates);
      setEditingWorkout(null);
      fetchWorkouts();
    } catch (error) {
      console.error('Error updating workout:', error);
      alert('Failed to update workout');
    }
  };

  const handleDeleteWorkout = async (workoutId) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await workoutsAPI.delete(workoutId);
        fetchWorkouts();
      } catch (error) {
        console.error('Error deleting workout:', error);
        alert('Failed to delete workout');
      }
    }
  };

  return (
    <div className="workouts-tab">
      <div className="tab-header">
        <h1 className="tab-title gradient-orange-red">
          Workout Programs
        </h1>
        <p className="tab-subtitle">
          {workouts.length > 0 
            ? 'Your workout history' 
            : 'No workouts yet - start your first one!'}
        </p>
      </div>

      <button className="add-workout-btn" onClick={() => setIsModalOpen(true)}>
        <Plus size={20} />
        Add Workout
      </button>

      <DateFilter selected={period} onChange={setPeriod} />

      <div className="workouts-grid">
        {workouts.length > 0 ? (
          workouts.map((workout) => (
            <WorkoutCard 
              key={workout._id}
              workout={workout}
              title={workout.title}
              exercises={workout.exercises?.length || 0}
              duration={`${workout.duration} min`}
              difficulty={workout.difficulty}
              date={new Date(workout.date).toLocaleDateString()}
              onEdit={handleEditWorkout}
              onDelete={handleDeleteWorkout}
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

      <AddWorkoutModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWorkout}
      />

      <EditWorkoutModal 
        isOpen={!!editingWorkout}
        onClose={() => setEditingWorkout(null)}
        onSave={handleSaveEdit}
        workout={editingWorkout}
      />
    </div>
  );
};

const WorkoutCard = ({ workout, title, exercises, duration, difficulty, date, onEdit, onDelete }) => (
  <div className="workout-card">
    <div className="workout-header-row">
      <div className="workout-icon">
        <Dumbbell size={32} />
      </div>
      <div className="workout-actions">
        <button onClick={() => onEdit(workout)} className="icon-btn" title="Edit">✏️</button>
        <button onClick={() => onDelete(workout._id)} className="icon-btn delete" title="Delete">🗑️</button>
      </div>
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