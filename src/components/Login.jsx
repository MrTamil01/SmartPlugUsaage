import React, { useState } from 'react';
import { LogIn, Zap, Sun, Wind, Plug, Battery, Power, Lightbulb } from 'lucide-react';

const Login = ({ setCurrentPage, setCurrentUser, showToast }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      showToast('Please enter both username and password!', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        setCurrentUser(data.user);
        if (data.user.mustChangePassword) {
          setCurrentPage('changePassword');
          showToast('Please change your password to continue.', 'success');
        } else {
          setCurrentPage(data.user.role === 'admin' ? 'dashboard' : 'userDashboard');
          showToast('Login successful!', 'success');
        }
      } else {
        showToast(data.message || 'Login failed!', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex flex-col lg:flex-row items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Left Section - Electricity Usage Stats */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-8 bg-gradient-to-b from-indigo-700 to-purple-700 text-white h-full min-h-screen lg:min-h-[600px] w-full lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-8 gap-4 opacity-10">
          {[...Array(64)].map((_, i) => {
            const icons = [Zap, Sun, Wind, Plug, Battery, Power, Lightbulb];
            const RandomIcon = icons[Math.floor(Math.random() * icons.length)];
            return (
              <div key={i} className="flex items-center justify-center">
                <RandomIcon size={24} className="text-white transform rotate-12" />
              </div>
            );
          })}
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 drop-shadow-lg">Electricity Usage Stats</h1>
          <p className="text-base sm:text-lg mb-8 max-w-md mx-auto leading-relaxed">
            Track and optimize your energy consumption with real-time insights and analytics.
          </p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 w-full lg:w-1/2">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full transform transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-full shadow-md">
              <LogIn className="text-white" size={32} />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6">Login to Dashboard</h2>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-2">User-ID</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all duration-200"
                placeholder="Enter user-ID"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all duration-200"
                placeholder="Enter password"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn size={20} />
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;