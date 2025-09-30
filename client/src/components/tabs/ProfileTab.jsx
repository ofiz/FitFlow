import React, { useState, useEffect } from 'react';
import { User, Save } from 'lucide-react';
import { userAPI } from '../../utils/api';
import '../../styles/tabs/ProfileTab.css';

const ProfileTab = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    currentWeight: 0,
    targetWeight: 0,
    height: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const data = await userAPI.getProfile();
      setUserData({
        name: data.name || '',
        email: data.email || '',
        currentWeight: data.currentWeight || 0,
        targetWeight: data.targetWeight || 0,
        height: data.height || 0
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="profile-tab"><p>Loading...</p></div>;
  }

  return (
    <div className="profile-tab">
      <div className="tab-header">
        <h1 className="tab-title gradient-gray-slate">
          Profile Settings ⚙️
        </h1>
        <p className="tab-subtitle">Manage your account and preferences</p>
      </div>

      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar-large">
            <User size={48} />
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{userData.name}</h2>
            <p className="profile-email">{userData.email}</p>
          </div>
        </div>

        <div className="profile-form">
          <InputField label="Full Name" value={userData.name} />
          <InputField label="Email" value={userData.email} type="email" />
          <InputField label="Current Weight (kg)" value={userData.currentWeight} type="number" />
          <InputField label="Target Weight (kg)" value={userData.targetWeight} type="number" />
          <InputField label="Height (cm)" value={userData.height} type="number" />
          
          <button className="save-btn">
            <Save size={20} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, value, type = "text" }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <input 
      type={type}
      value={value}
      className="form-input"
      readOnly
    />
  </div>
);

export default ProfileTab;