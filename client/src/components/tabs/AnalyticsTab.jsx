import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity, AlertCircle, User } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyticsAPI, userAPI } from '../../utils/api';
import DateFilter from '../common/DateFilter';
import '../../styles/tabs/AnalyticsTab.css';

const AnalyticsTab = () => {
  const [period, setPeriod] = useState('week');
  const [workoutStats, setWorkoutStats] = useState(null);
  const [nutritionStats, setNutritionStats] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, [period]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [workouts, nutrition, overviewData] = await Promise.all([
        analyticsAPI.getWorkoutStats(period),
        analyticsAPI.getNutritionStats(period),
        analyticsAPI.getOverview()
      ]);
      
      setWorkoutStats(workouts);
      setNutritionStats(nutrition);
      setOverview(overviewData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-tab">
        <div className="tab-header">
          <h1 className="tab-title gradient-teal-green">
            Analytics & Stats 📊
          </h1>
          <p className="tab-subtitle">Track your progress with detailed insights</p>
        </div>
        <div className="loading-state">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="analytics-tab">
      <div className="tab-header">
        <h1 className="tab-title gradient-teal-green">
          Analytics & Stats 📊
        </h1>
        <p className="tab-subtitle">Track your progress with detailed insights</p>
      </div>

      {!overview?.hasCompleteProfile && (
        <div className="alert-banner">
          <AlertCircle size={20} />
          <div className="alert-content">
            <p className="alert-title">Complete Your Profile</p>
            <p className="alert-text">
              Update your weight, height, and goals in the Profile tab to see more personalized analytics and insights.
            </p>
          </div>
        </div>
      )}

      <DateFilter selected={period} onChange={setPeriod} />

      {/* Overview Stats */}
      <div className="stats-overview">
        <StatCard
          title="Workouts This Week"
          value={overview?.stats?.workoutsThisWeek || 0}
          icon={<Activity size={24} />}
          color="orange"
        />
        <StatCard
          title="Calories Today"
          value={overview?.stats?.caloriesToday || 0}
          subtitle={`Goal: ${overview?.user?.calorieGoal || 2000}`}
          icon={<TrendingUp size={24} />}
          color="green"
        />
        {overview?.stats?.bmi && (
          <StatCard
            title="BMI"
            value={overview.stats.bmi}
            icon={<User size={24} />}
            color="blue"
          />
        )}
        {overview?.user?.currentWeight > 0 && overview?.user?.targetWeight > 0 && (
          <StatCard
            title="Weight Progress"
            value={`${overview.user.currentWeight} kg`}
            subtitle={`Target: ${overview.user.targetWeight} kg`}
            icon={<TrendingUp size={24} />}
            color="purple"
          />
        )}
      </div>

      <div className="analytics-grid">
        {/* Workout Frequency Chart */}
        <div className="chart-card">
          <h3 className="chart-title">Workout Frequency</h3>
          {workoutStats && workoutStats.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={workoutStats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.6)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.6)"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill="#fb923c" name="Workouts" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-placeholder">
              <Activity size={64} />
              <p>No workout data for this period</p>
            </div>
          )}
          {workoutStats && (
            <div className="chart-summary">
              <SummaryItem label="Total Workouts" value={workoutStats.summary.totalWorkouts} />
              <SummaryItem label="Total Duration" value={`${workoutStats.summary.totalDuration} min`} />
              <SummaryItem label="Avg Duration" value={`${workoutStats.summary.avgDuration} min`} />
            </div>
          )}
        </div>

        {/* Calorie Intake Chart */}
        <div className="chart-card">
          <h3 className="chart-title">Calorie Intake</h3>
          {nutritionStats && nutritionStats.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={nutritionStats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.6)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.6)"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="calories" 
                  stroke="#4ade80" 
                  strokeWidth={2}
                  name="Calories"
                  dot={{ fill: '#4ade80', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-placeholder">
              <TrendingUp size={64} />
              <p>No nutrition data for this period</p>
            </div>
          )}
          {nutritionStats && (
            <div className="chart-summary">
              <SummaryItem label="Total Calories" value={nutritionStats.summary.totalCalories} />
              <SummaryItem label="Avg per Meal" value={nutritionStats.summary.avgCalories} />
              <SummaryItem label="Total Meals" value={nutritionStats.summary.totalMeals} />
            </div>
          )}
        </div>

        {/* Macros Breakdown Chart */}
        <div className="chart-card">
          <h3 className="chart-title">Macros Breakdown</h3>
          {nutritionStats && nutritionStats.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={nutritionStats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.6)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.6)"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="protein" fill="#ef4444" name="Protein (g)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="carbs" fill="#eab308" name="Carbs (g)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="fats" fill="#3b82f6" name="Fats (g)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-placeholder">
              <Activity size={64} />
              <p>No macro data for this period</p>
            </div>
          )}
          {nutritionStats && (
            <div className="chart-summary">
              <SummaryItem label="Protein" value={`${nutritionStats.summary.totalProtein}g`} />
              <SummaryItem label="Carbs" value={`${nutritionStats.summary.totalCarbs}g`} />
              <SummaryItem label="Fats" value={`${nutritionStats.summary.totalFats}g`} />
            </div>
          )}
        </div>

        {/* Workout Duration Trend */}
        <div className="chart-card">
          <h3 className="chart-title">Workout Duration Trend</h3>
          {workoutStats && workoutStats.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={workoutStats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.6)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.6)"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="duration" 
                  stroke="#22d3ee" 
                  strokeWidth={2}
                  name="Minutes"
                  dot={{ fill: '#22d3ee', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-placeholder">
              <Activity size={64} />
              <p>No duration data for this period</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <div className={`stat-card stat-${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <p className="stat-label">{title}</p>
      <h3 className="stat-value">{value}</h3>
      {subtitle && <p className="stat-subtitle">{subtitle}</p>}
    </div>
  </div>
);

const SummaryItem = ({ label, value }) => (
  <div className="summary-item">
    <span className="summary-label">{label}</span>
    <span className="summary-value">{value}</span>
  </div>
);

export default AnalyticsTab;