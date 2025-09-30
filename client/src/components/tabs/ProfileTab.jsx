import React from 'react';
import { User, Save } from 'lucide-react';
import '../../styles/tabs/ProfileTab.css';

const ProfileTab = () => {
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
            <h2 className="profile-name">John Doe</h2>
            <p className="profile-email">john.doe@email.com</p>
          </div>
        </div>

        <div className="profile-form">
          <InputField label="Full Name" placeholder="John Doe" defaultValue="John Doe" />
          <InputField label="Email" placeholder="john.doe@email.com" defaultValue="john.doe@email.com" type="email" />
          <InputField label="Current Weight (kg)" placeholder="75" defaultValue="75" type="number" />
          <InputField label="Target Weight (kg)" placeholder="70" defaultValue="70" type="number" />
          <InputField label="Height (cm)" placeholder="175" defaultValue="175" type="number" />
          
          <button className="save-btn">
            <Save size={20} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, placeholder, defaultValue, type = "text" }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <input 
      type={type}
      placeholder={placeholder}
      defaultValue={defaultValue}
      className="form-input"
    />
  </div>
);

export default ProfileTab;