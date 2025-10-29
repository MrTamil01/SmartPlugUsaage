import React, { useState, useEffect } from 'react';
import { Zap, LogOut, Bot, Send, X, TrendingUp, Activity, BarChart3 } from 'lucide-react';

const UserDashboard = ({ setCurrentPage, showToast, currentUser }) => {
  const [userData, setUserData] = useState(null);
  const [iotData, setIotData] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/user/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isChatModalOpen) {
        setIsChatModalOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isChatModalOpen]);

  useEffect(() => {
    const fetchIotData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/pzem`);
        if (response.ok) {
          const data = await response.json();
          setIotData(data);
        }
      } catch (error) {
        console.error('Error fetching IoT data:', error);
      }
    };

    fetchIotData();
    const interval = setInterval(fetchIotData, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const userMessage = { sender: 'user', text: currentMessage };
    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');

    setTimeout(() => {
      const aiResponse = getAIResponse(currentMessage.toLowerCase(), userData);
      setChatMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
    }, 1000);
  };

  const getAIResponse = (message, userData) => {
    if (message.includes('total') || message.includes('power') || message.includes('usage')) {
      const totalPower = userData?.devices.reduce((sum, d) => sum + d.usage, 0) || 0;
      return `Your total power consumption is ${totalPower}W from ${userData?.devices.length || 0} appliances.`;
    }
    if (message.includes('add') || message.includes('new')) {
      return "To add a new appliance, contact your admin or use the admin dashboard if you have access.";
    }
    if (message.includes('save') || message.includes('energy') || message.includes('tip')) {
      return "Energy-saving tips: Turn off appliances when not in use, use LED bulbs, and maintain your devices regularly.";
    }
    if (message.includes('highest') || message.includes('most')) {
      const highest = userData?.devices.reduce((max, d) => d.usage > max.usage ? d : max, userData.devices[0]);
      return highest ? `Your highest power appliance is ${highest.name} at ${highest.usage}W.` : "You don't have any appliances yet.";
    }
    return "I'm here to help with your appliance management. Ask me about power usage, energy tips, or appliance details!";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-600 to-blue-600 p-2.5 rounded-lg shadow-lg">
                <Zap className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome {userData ? userData.name : 'User'}</h1>
                <p className="text-sm text-gray-500">Monitor and manage your devices</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsChatModalOpen(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium flex items-center gap-2 text-sm"
              >
                <Bot size={18} />
                AI Assistant
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('currentUser');
                  setCurrentPage('login');
                  showToast('Logged out successfully!', 'success');
                }}
                className="px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all font-medium flex items-center gap-2 text-sm"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>

        {userData ? (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-blue-50 p-2.5 rounded-lg">
                    <Activity className="text-blue-600" size={20} />
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Power</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {userData.devices.reduce((sum, d) => sum + d.usage, 0).toFixed(0)}
                  <span className="text-lg text-gray-500 ml-1">W</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">Real-time consumption</p>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-green-50 p-2.5 rounded-lg">
                    <BarChart3 className="text-green-600" size={20} />
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Devices</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {userData.devices.length}
                  <span className="text-lg text-gray-500 ml-1">Active</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">Connected appliances</p>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-purple-50 p-2.5 rounded-lg">
                    <TrendingUp className="text-purple-600" size={20} />
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Average</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {userData.devices.length > 0 ? (userData.devices.reduce((sum, d) => sum + d.usage, 0) / userData.devices.length).toFixed(0) : 0}
                  <span className="text-lg text-gray-500 ml-1">W</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">Per device usage</p>
              </div>
            </div>

            {/* User Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg">
                  {userData.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{userData.name}</h3>
                  <p className="text-sm text-gray-500 font-mono">ID: {userData.username}</p>
                </div>
              </div>
            </div>

            {/* Appliances List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h4 className="text-lg font-bold text-gray-900">Connected Appliances</h4>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold">
                  {userData.devices.length} Device{userData.devices.length !== 1 ? 's' : ''}
                </span>
              </div>

              {userData.devices.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
                  <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Zap className="text-gray-300" size={28} />
                  </div>
                  <p className="text-gray-600 font-medium mb-1">No appliances added yet</p>
                  <p className="text-sm text-gray-400">Connect your first device to start monitoring</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userData.devices.map(device => {
                    const isMatchingDevice = iotData && iotData.device_id === device.id;
                    return (
                      <div key={device.id} className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg p-4 border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all">
                        <div className="flex items-start gap-4">
                          <div className="bg-gradient-to-br from-yellow-400 to-orange-400 p-3 rounded-lg shadow-sm flex-shrink-0">
                            <Zap className="text-white" size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div>
                                <h5 className="font-semibold text-gray-900 text-base">{device.name}</h5>
                                <p className="text-xs text-gray-500 font-mono mt-0.5">Device ID: {device.id}</p>
                              </div>
                              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 flex-shrink-0">
                                <p className="text-2xl font-bold text-indigo-600">{device.usage}<span className="text-sm text-gray-500 ml-0.5">W</span></p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3 text-xs">
                              <div className="bg-white rounded-md px-2.5 py-1.5 border border-gray-100">
                                <p className="text-gray-500 font-medium">Voltage</p>
                                <p className="text-gray-900 font-semibold">{device.voltage || 0}V</p>
                              </div>
                              <div className="bg-white rounded-md px-2.5 py-1.5 border border-gray-100">
                                <p className="text-gray-500 font-medium">Current</p>
                                <p className="text-gray-900 font-semibold">{device.current || 0}A</p>
                              </div>
                              <div className="bg-white rounded-md px-2.5 py-1.5 border border-gray-100">
                                <p className="text-gray-500 font-medium">Power</p>
                                <p className="text-gray-900 font-semibold">{device.power || 0}W</p>
                              </div>
                              <div className="bg-white rounded-md px-2.5 py-1.5 border border-gray-100">
                                <p className="text-gray-500 font-medium">Frequency</p>
                                <p className="text-gray-900 font-semibold">{device.frequency || 0}Hz</p>
                              </div>
                              <div className="bg-white rounded-md px-2.5 py-1.5 border border-gray-100">
                                <p className="text-gray-500 font-medium">PF</p>
                                <p className="text-gray-900 font-semibold">{device.power_factor || 0}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Loading dashboard...</p>
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {isChatModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col animate-slide-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-2.5 rounded-lg shadow-lg">
                  <Bot className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Barathraja AI</h2>
                  <p className="text-xs text-gray-500">Your intelligent assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsChatModalOpen(false)}
                className="p-2 hover:bg-white rounded-lg transition-colors text-gray-400 hover:text-gray-600"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
              {chatMessages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-br from-purple-100 to-indigo-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Bot className="text-purple-600" size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to Barathraja AI</h3>
                  <p className="text-gray-600 mb-1">Your intelligent assistant for appliance management</p>
                  <p className="text-sm text-gray-500">Ask me about energy usage, device status, or optimization tips!</p>
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                        : 'bg-white text-gray-800 border border-gray-100'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-5 border-t border-gray-100 bg-white">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from {
            transform: scale(0.95) translateY(20px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;