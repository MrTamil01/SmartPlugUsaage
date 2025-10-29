import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';

const Signup = ({ setCurrentPage, setCurrentUser, showToast }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!username || !password || !confirmPassword || !name) {
      showToast('Please fill in all fields!', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match!', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters long!', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, name }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        setCurrentUser(data.user);
        setCurrentPage(data.user.role === 'admin' ? 'dashboard' : 'userDashboard');
        showToast('Account created successfully!', 'success');
      } else {
        showToast(data.message || 'Signup failed!', 'error');
      }
    } catch (error) {
      console.error('Signup error:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl">
            <UserPlus className="text-white" size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Create Account</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
              placeholder="Enter password"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
              placeholder="Confirm password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <UserPlus size={20} />
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => setCurrentPage('login')}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Already have an account? Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
