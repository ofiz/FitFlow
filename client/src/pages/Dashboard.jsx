// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Home, Dumbbell, Apple, Camera, Target, Brain, TrendingUp, Calculator, MessageCircle, User, Menu, X, LogOut, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userAPI, authAPI } from '../utils/api';
import '../styles/components/Dashboard.css';

// Import sub-components
import OverviewTab from '../components/tabs/OverviewTab';
import WorkoutsTab from '../components/tabs/WorkoutsTab';
import NutritionTab from '../components/tabs/NutritionTab';
import ProgressTab from '../components/tabs/ProgressTab';
import GoalsTab from '../components/tabs/GoalsTab';
import CalculatorTab from '../components/tabs/CalculatorTab';
import TriviaTab from '../components/tabs/TriviaTab';
import AnalyticsTab from '../components/tabs/AnalyticsTab';
import AICoachTab from '../components/tabs/AICoachTab';
import ProfileTab from '../components/tabs/ProfileTab';
import PracticalContentTab from '../components/tabs/PracticalContentTab';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userData, setUserData] = useState({ name: '', email: '' });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const data = await userAPI.getProfile();
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, clear local storage and redirect
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const menuItems = [
    { id: 'overview', icon: Home, label: 'Overview', color: 'purple-pink' },
    { id: 'workouts', icon: Dumbbell, label: 'Workouts', color: 'orange-red' },
    { id: 'nutrition', icon: Apple, label: 'Nutrition Tracker', color: 'green-emerald' },
    { id: 'progress', icon: Camera, label: 'Progress Gallery', color: 'blue-cyan' },
    { id: 'goals', icon: Target, label: 'Goals', color: 'yellow-orange' },
    { id: 'calculator', icon: Calculator, label: 'Calorie Calculator', color: 'red-pink' },
    { id: 'trivia', icon: Brain, label: 'Nutrition Trivia', color: 'indigo-purple' },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics', color: 'teal-green' },
    { id: 'practical', icon: ExternalLink, label: 'Practical Content', color: 'cyan-blue' },  
    { id: 'ai-coach', icon: MessageCircle, label: 'AI Coach', color: 'violet-purple' },
    { id: 'profile', icon: User, label: 'Profile', color: 'gray-slate' },
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'overview': return <OverviewTab />;
      case 'workouts': return <WorkoutsTab />;
      case 'nutrition': return <NutritionTab />;
      case 'progress': return <ProgressTab />;
      case 'goals': return <GoalsTab />;
      case 'calculator': return <CalculatorTab />;
      case 'trivia': return <TriviaTab />;
      case 'analytics': return <AnalyticsTab />;
      case 'practical': return <PracticalContentTab />;  
      case 'ai-coach': return <AICoachTab />;
      case 'profile': return <ProfileTab />;
      default: return <OverviewTab />;
    }
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        {/* Logo */}
        <div className="sidebar-header">
          {sidebarOpen && (
            <div className="logo-container">
              <div className="logo-icon">
                <Dumbbell className="logo-icon-svg" />
              </div>
              <span className="logo-text">FitFlow</span>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="toggle-btn"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-item ${isActive ? 'active' : ''} ${item.color}`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="sidebar-footer">
          <div className={`user-info ${!sidebarOpen ? 'collapsed' : ''}`}>
            <div className="user-avatar">
              {userData.name ? userData.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
            </div>
            {sidebarOpen && (
              <div className="user-details">
                <div className="user-name">{userData.name || 'User'}</div>
                <div className="user-status">Premium Member</div>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;