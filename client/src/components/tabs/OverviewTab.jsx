import React from 'react';
import { TrendingUp, Dumbbell, Apple, Camera } from 'lucide-react';
import '../../styles/tabs/OverviewTab.css';

const OverviewTab = () => {
  return (
    <div className="overview-tab">
      <div className="tab-header">
        <h1 className="tab-title gradient-purple-pink">
          Welcome Back, John! 👋
        </h1>
        <p className="tab-subtitle">Here's your fitness summary for today</p>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="Workouts This Week" 
          value="5" 
          subtitle="+2 from last week" 
          gradient="orange-red" 
        />
        <StatCard 
          title="Calories Today" 
          value="1,850" 
          subtitle="350 remaining" 
          gradient="green-emerald" 
        />
        <StatCard 
          title="Current Weight" 
          value="75 kg" 
          subtitle="-2kg this month" 
          gradient="blue-cyan" 
        />
        <StatCard 
          title="Active Streak" 
          value="12 days" 
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