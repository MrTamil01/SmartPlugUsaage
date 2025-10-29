import React, { useState } from 'react';
import { Key } from 'lucide-react';

const ChangePassword = ({ currentUser, setCurrentUser, setCurrentPage, showToast }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/auth/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        const updatedUser = { ...currentUser, mustChangePassword: false };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        showToast('Password changed successfully!', 'success');
        setCurrentPage(currentUser.role === 'admin' ? 'dashboard' : 'userDashboard');
      } else {
        showToast(data.message || 'Failed to change password', 'error');
      }
    } catch (error) {
      console.error('Change password error:', error);
      showToast('Network error. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl">
            <Key className="text-white" size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
              placeholder="Confirm new password"
            />
          </div>
          <button
            type="submit"
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg font-medium flex items-center justify-center gap-2"
          >
            <Key size={20} />
            Change Password
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => setCurrentPage('addAppliance')}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Back to Appliances
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
