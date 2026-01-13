import React, { useState, useContext } from 'react';
import { useExpense } from '../context/ExpenseContext';
import '../styles/Profile.css';

const Profile = () => {
  const { user, updateProfile, changePassword } = useExpense();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [formData, setFormData] = useState(user || {
    name: '',
    email: '',
    phone: '',
    currency: 'USD',
    monthlyBudget: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(user || { name: '', email: '', phone: '', currency: 'USD', monthlyBudget: 0 });
    setIsEditing(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    setPasswordError('');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPasswordError('Failed to update password. Please check your current password.');
    }
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError('');
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="header-left">
            <h1>My Profile</h1>
            <p className="subtitle">Manage your account settings</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn-secondary"
              onClick={() => setShowPasswordModal(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Change Password
            </button>
            <button 
              className="btn-primary"
              onClick={() => setIsEditing(!isEditing)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-avatar">
            <div className="avatar-circle">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
          </div>

          <div className="profile-info">
            {isEditing ? (
              <form className="profile-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Currency</label>
                  <input
                    type="text"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Monthly Budget</label>
                  <input
                    type="number"
                    name="monthlyBudget"
                    value={formData.monthlyBudget}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="save-btn" onClick={handleSave}>
                    Save Changes
                  </button>
                  <button type="button" className="cancel-btn" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-details">
                <div className="detail-group">
                  <span className="detail-label">Name</span>
                  <span className="detail-value">{user?.name}</span>
                </div>

                <div className="detail-group">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{user?.email}</span>
                </div>

                <div className="detail-group">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{user?.phone || 'Not set'}</span>
                </div>

                <div className="detail-group">
                  <span className="detail-label">Currency</span>
                  <span className="detail-value">{user?.currency}</span>
                </div>

                <div className="detail-group">
                  <span className="detail-label">Monthly Budget</span>
                  <span className="detail-value">{user?.monthlyBudget || 'Not set'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <span className="stat-label">Account Type</span>
            <span className="stat-value">Personal</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Currency</span>
            <span className="stat-value">{user?.currency || 'USD'}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Monthly Budget</span>
            <span className="stat-value">{user?.monthlyBudget || 'Not set'}</span>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={handleClosePasswordModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Change Password</h2>
              <button className="btn-close" onClick={handleClosePasswordModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="password-form">
              {passwordError && (
                <div className="error-message">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {passwordError}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="currentPassword">Current Password *</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Enter current password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password *</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Enter new password (min 6 characters)"
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Re-enter new password"
                  minLength={6}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleClosePasswordModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
