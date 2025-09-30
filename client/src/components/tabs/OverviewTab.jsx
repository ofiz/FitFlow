import React, { useState, useEffect } from 'react';
import { TrendingUp, Dumbbell, Apple, Camera } from 'lucide-react';
import { dashboardAPI, userAPI } from '../../utils/api';
import '../../styles/tabs/OverviewTab.css';

const OverviewTab = () => {
  const [stats, setStats] = useState({
    workoutsThisWeek: 0,
    workoutsChange: 0,
    caloriesToday: 0,
    caloriesRemaining: 0,
    currentWeight: 0,
    weightChange: 0,
    activeStreak: 0
  });
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, userData] = await Promise.all([
        dashboardAPI.getStats(),
        userAPI.getProfile()
      ]);
      
      setStats(statsData);
      setUserName(userData.name || 'there');
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="overview-tab">
        <div className="loading-container">
          <p>Loading your stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overview-tab">
      <div className="tab-header">
        <h1 className="tab-title gradient-purple-pink">
          Welcome Back, {userName}! 👋
        </h1>
        <p className="tab-subtitle">Here's your fitness summary for today</p>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="Workouts This Week" 
          value={stats.workoutsThisWeek} 
          subtitle={`${stats.workoutsChange >= 0 ? '+' : ''}${stats.workoutsChange} from last week`} 
          gradient="orange-red" 
        />
        <StatCard 
          title="Calories Today" 
          value={stats.caloriesToday} 
          subtitle={`${stats.caloriesRemaining} remaining`} 
          gradient="green-emerald" 
        />
        <StatCard 
          title="Current Weight" 
          value={stats.currentWeight > 0 ? `${stats.currentWeight} kg` : 'Not set'} 
          subtitle={`${stats.weightChange}kg this month`} 
          gradient="blue-cyan" 
        />
        <StatCard 
          title="Active Streak" 
          value={`${stats.activeStreak} days`} 
          subtitle="Keep it up! 🔥" 
          gradient="purple-pink" 
        />
      </div>

      <div className="quick-actions">
        <QuickAction 
          icon={Dumbbell} 
          title="Log Workout" 
          description="Track today's training" 
        />
        <QuickAction 
          icon={Apple} 
          title="Add Meal" 
          description="Log your nutrition" 
        />
        <QuickAction 
          icon={Camera} 
          title="Upload Photo" 
          description="Track progress" 
        />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, gradient }) => (
  <div className="stat-card">
    <div className={`stat-icon gradient-${gradient}`}>
      <TrendingUp size={24} />
    </div>
    <h3 className="stat-title">{title}</h3>
    <p className="stat-value">{value}</p>
    <p className="stat-subtitle">{subtitle}</p>
  </div>
);

const QuickAction = ({ icon: Icon, title, description }) => (
  <button className="quick-action-card">
    <Icon className="quick-action-icon" size={40} />
    <h3 className="quick-action-title">{title}</h3>
    <p className="quick-action-description">{description}</p>
  </button>
);

export default OverviewTab;