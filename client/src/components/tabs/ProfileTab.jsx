import React, { useState, useEffect } from 'react';
import { User, Save, Lock } from 'lucide-react';
import { userAPI } from '../../utils/api';
import '../../styles/tabs/ProfileTab.css';

const ProfileTab = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    currentWeight: '',
    targetWeight: '',
    height: '',
    age: '',
    gender: 'other',
    activityLevel: 'moderate',
    calorieGoal: 2000
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const data = await userAPI.getProfile();
      setUserData({
        name: data.name || '',
        email: data.email || '',
        currentWeight: data.currentWeight || '',
        targetWeight: data.targetWeight || '',
        height: data.height || '',
        age: data.age || '',
        gender: data.gender || 'other',
        activityLevel: data.activityLevel || 'moderate',
        calorieGoal: data.calorieGoal || 2000
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Convert empty strings to 0 for numeric fields
      const dataToSend = {
        ...userData,
        currentWeight: userData.currentWeight === '' ? 0 : parseFloat(userData.currentWeight),
        targetWeight: userData.targetWeight === '' ? 0 : parseFloat(userData.targetWeight),
        height: userData.height === '' ? 0 : parseFloat(userData.height),
        age: userData.age === '' ? 0 : parseInt(userData.age),
        calorieGoal: userData.calorieGoal === '' ? 2000 : parseInt(userData.calorieGoal)
      };

      await userAPI.updateProfile(dataToSend);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
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

        <form className="profile-form" onSubmit={handleSubmit}>
          <InputField 
            label="Full Name" 
            name="name"
            value={userData.name}
            onChange={handleChange}
            required
          />
          
          <InputField 
            label="Email" 
            name="email"
            value={userData.email} 
            type="email"
            disabled
            helperText="Email cannot be changed"
          />

          <div className="form-row">
            <InputField 
              label="Current Weight (kg)" 
              name="currentWeight"
              value={userData.currentWeight}
              onChange={handleChange}
              type="number"
              step="0.1"
              placeholder="0"
            />
            
            <InputField 
              label="Target Weight (kg)" 
              name="targetWeight"
              value={userData.targetWeight}
              onChange={handleChange}
              type="number"
              step="0.1"
              placeholder="0"
            />
          </div>

          <div className="form-row">
            <InputField 
              label="Height (cm)" 
              name="height"
              value={userData.height}
              onChange={handleChange}
              type="number"
              placeholder="0"
            />
            
            <InputField 
              label="Age" 
              name="age"
              value={userData.age}
              onChange={handleChange}
              type="number"
              placeholder="0"
            />
          </div>

          <SelectField
            label="Gender"
            name="gender"
            value={userData.gender}
            onChange={handleChange}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' }
            ]}
          />

          <SelectField
            label="Activity Level"
            name="activityLevel"
            value={userData.activityLevel}
            onChange={handleChange}
            options={[
              { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
              { value: 'light', label: 'Light (exercise 1-3 days/week)' },
              { value: 'moderate', label: 'Moderate (exercise 3-5 days/week)' },
              { value: 'active', label: 'Active (exercise 6-7 days/week)' },
              { value: 'very_active', label: 'Very Active (intense exercise daily)' }
            ]}
          />

          <InputField 
            label="Daily Calorie Goal" 
            name="calorieGoal"
            value={userData.calorieGoal}
            onChange={handleChange}
            type="number"
            placeholder="2000"
          />
          
          <button type="submit" className="save-btn" disabled={saving}>
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          <button 
            type="button" 
            className="change-password-btn" 
            onClick={() => setShowPasswordModal(true)}
          >
            <Lock size={20} />
            Change Password
          </button>
        </form>
      </div>

      {showPasswordModal && (
        <ChangePasswordModal 
          onClose={() => setShowPasswordModal(false)} 
        />
      )}
    </div>
  );
};

const InputField = ({ label, name, value, type = "text", onChange, disabled = false, step, placeholder, required = false, helperText }) => (
  <div className="form-group">
    <label className="form-label">
      {label} {required && <span className="required">*</span>}
    </label>
    <input 
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="form-input"
      disabled={disabled}
      step={step}
      placeholder={placeholder}
      required={required}
    />
    {helperText && <small className="helper-text">{helperText}</small>}
  </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="form-input"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const ChangePasswordModal = ({ onClose }) => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
      return "Password must contain uppercase, lowercase, number and special character (@$!%*?&)";
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};

    // Validate current password
    if (!passwords.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    // Validate new password
    const passwordError = validatePassword(passwords.newPassword);
    if (passwordError) {
      newErrors.newPassword = passwordError;
    }

    // Validate password match
    if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await userAPI.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      alert('Password changed successfully!');
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      setErrors({ currentPassword: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Change Password</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="password-form">
          <div className="form-group">
            <label className="form-label">Current Password *</label>
            <input
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handleChange}
              className={`form-input ${errors.currentPassword ? 'error' : ''}`}
              placeholder="Enter current password"
            />
            {errors.currentPassword && (
              <span className="error-message">{errors.currentPassword}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">New Password *</label>
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handleChange}
              className={`form-input ${errors.newPassword ? 'error' : ''}`}
              placeholder="Enter new password"
            />
            {errors.newPassword && (
              <span className="error-message">{errors.newPassword}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleChange}
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Re-enter new password"
            />
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          <div className="password-requirements">
            <p className="requirements-title">Password must contain:</p>
            <ul>
              <li>At least 8 characters</li>
              <li>Uppercase and lowercase letters</li>
              <li>At least one number</li>
              <li>At least one special character (@$!%*?&)</li>
            </ul>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileTab;