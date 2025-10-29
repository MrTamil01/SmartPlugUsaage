import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Edit2, Save, User, Zap, Trash2, BarChart3, Download, AlertCircle, CheckCircle, TrendingUp, Users, Settings, LogIn, LogOut, UserPlus, Key } from 'lucide-react';
import UserDashboard from './UserDashboard';
import AddAppliances from './AddAppliances';
import Toast from './components/Toast';
import ConfirmDialog from './components/ConfirmDialog';
import ChangePassword from './components/ChangePassword';
import Login from './components/Login';
import Signup from './components/Signup';
import StatCard from './components/StatCard';

const initializeUsers = () => {
  const storedUsers = localStorage.getItem('mockUsers');
  return storedUsers ? JSON.parse(storedUsers) : [
    { id: 'admin1', username: 'admin', password: 'admin123', role: 'admin', name: 'Admin User' },
    { id: 'user1', username: 'user', password: 'user123', role: 'user', name: 'Test User' },
  ];
};



const AdminDashBoard = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', userid: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState('login');
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingDevice, setEditingDevice] = useState(null);
  const [editName, setEditName] = useState('');
  const [editUsage, setEditUsage] = useState('');
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceUsage, setNewDeviceUsage] = useState('');
  const [newDeviceId, setNewDeviceId] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setCurrentPage(user.role === 'admin' ? 'dashboard' : 'userDashboard');
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (currentUser?.role === 'admin') {
        const token = localStorage.getItem('token');
        try {
          const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/user/admin-dashboard`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setUsers(data.filter(user => user.role !== 'admin'));
          } else {
            console.error('Failed to fetch users');
          }
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      }
    };
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  const refreshUsers = async () => {
    if (currentUser?.role === 'admin') {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/user/admin-dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data.filter(user => user.role !== 'admin'));
        } else {
          console.error('Failed to refresh users');
        }
      } catch (error) {
        console.error('Error refreshing users:', error);
      }
    }
  };

  useEffect(() => {
    const sorted = [...users].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'devices') return b.devices.length - a.devices.length;
      if (sortBy === 'power') {
        const aPower = a.devices.reduce((sum, d) => sum + d.usage, 0);
        const bPower = b.devices.reduce((sum, d) => sum + d.usage, 0);
        return bPower - aPower;
      }
      return 0;
    });
    setFilteredUsers(sorted);
  }, [users, sortBy]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const addUser = async () => {
      if (newUser.name && newUser.username) {
        const token = localStorage.getItem('token');
        try {
          const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/auth/create-user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ username: newUser.username, name: newUser.name }),
          });

          const data = await response.json();

          if (response.ok) {
            const user = {
              _id: data.user._id,
              name: newUser.name,
              username: newUser.username,
              devices: []
            };
            setUsers([...users, user]);
            setNewUser({ name: '', username: '' });
            showToast('User added successfully!', 'success');
          } else {
            showToast(data.message || 'Failed to add user!', 'error');
          }
        } catch (error) {
          console.error('Add user error:', error);
          showToast('Network error. Please try again.', 'error');
        }
      } else {
        showToast('Please fill in all fields', 'error');
      }
  };

  const searchUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const deleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(users.filter(u => u._id !== userId));
        setDeleteConfirm(null);
        showToast('User deleted successfully!', 'success');
      } else {
        showToast(data.message || 'Failed to delete user', 'error');
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Delete user error:', error);
      showToast('Network error. Please try again.', 'error');
      setDeleteConfirm(null);
    }
  };

  const exportData = () => {
    const data = JSON.stringify(users, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-data-${Date.now()}.json`;
    a.click();
    showToast('Data exported successfully!', 'success');
  };

  const addDevice = async () => {
    if (!newDeviceName.trim()) {
      showToast('Please enter appliance name', 'error');
      return;
    }
    if (!newDeviceUsage.trim() || isNaN(parseFloat(newDeviceUsage)) || parseFloat(newDeviceUsage) <= 0) {
      showToast('Please enter valid watts (greater than 0)', 'error');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/user/add-device`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: selectedUser._id, name: newDeviceName, usage: parseFloat(newDeviceUsage), id: newDeviceId }),
      });
      const data = await response.json();
      if (response.ok) {
        refreshUsers();
        setNewDeviceName('');
        setNewDeviceUsage('');
        setNewDeviceId('');
        showToast('Appliance added successfully!', 'success');
      } else {
        showToast(data.message || 'Failed to add appliance', 'error');
      }
    } catch (error) {
      console.error('Add device error:', error);
      showToast('Network error. Please try again.', 'error');
    }
  };

  const saveEdit = async () => {
    if (!editName.trim()) {
      showToast('Please enter appliance name', 'error');
      return;
    }
    if (!editUsage.trim() || isNaN(parseFloat(editUsage)) || parseFloat(editUsage) <= 0) {
      showToast('Please enter valid watts (greater than 0)', 'error');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/user/update-device/${editingDevice}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: selectedUser._id, name: editName, usage: parseFloat(editUsage) }),
      });
      const data = await response.json();
      if (response.ok) {
        setEditingDevice(null);
        refreshUsers();
        showToast('Appliance updated successfully!', 'success');
      } else {
        showToast(data.message || 'Failed to update appliance', 'error');
      }
    } catch (error) {
      console.error('Update device error:', error);
      showToast('Network error. Please try again.', 'error');
    }
  };

  const deleteDevice = async (deviceId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/user/delete-device/${deviceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: selectedUser._id }),
      });
      const data = await response.json();
      if (response.ok) {
        refreshUsers();
        setDeleteConfirm(null);
        showToast('Appliance deleted successfully!', 'success');
      } else {
        showToast(data.message || 'Failed to delete appliance', 'error');
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Delete device error:', error);
      showToast('Network error. Please try again.', 'error');
      setDeleteConfirm(null);
    }
  };

  const totalAppliances = users.reduce((sum, u) => sum + u.devices.length, 0);
  const totalPower = users.reduce((sum, u) => sum + u.devices.reduce((s, d) => s + d.usage, 0), 0);
  const avgPowerPerUser = users.length > 0 ? (totalPower / users.length).toFixed(0) : 0;

  if (currentPage === 'login') {
    return <Login setCurrentPage={setCurrentPage} setCurrentUser={setCurrentUser} showToast={showToast} />;
  }

  if (currentPage === 'signup') {
    return <Signup setCurrentPage={setCurrentPage} setCurrentUser={setCurrentUser} showToast={showToast} />;
  }

  if (currentPage === 'changePassword') {
    return <ChangePassword currentUser={currentUser} setCurrentUser={setCurrentUser} setCurrentPage={setCurrentPage} showToast={showToast} />;
  }

  return currentPage === 'dashboard' && currentUser?.role === 'admin' ? (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {deleteConfirm && (
        <ConfirmDialog
          message={deleteConfirm.type === 'user' ? "Are you sure you want to delete this user and all their appliances?" : "Are you sure you want to delete this appliance?"}
          onConfirm={() => deleteConfirm.type === 'user' ? deleteUser(deleteConfirm.id) : deleteDevice(deleteConfirm.id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
                <Settings size={32} />
              </div>
              Admin Dashboard
            </h1>
            <div className="flex gap-3">
              <button
                onClick={exportData}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg flex items-center gap-2 font-medium"
              >
                <Download size={20} />
                Export Data
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem('currentUser');
                  setCurrentPage('login');
                  showToast('Logged out successfully!', 'success');
                }}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg font-medium flex items-center gap-2"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={Users} label="Total Users" value={users.length} color="indigo" bgColor="bg-indigo-50" />
           
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-8 border-2 border-green-100 shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="text-green-600" />
              Add New User
            </h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
              />
              <input
                type="text"
                placeholder="User ID"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
              />
              <button
                onClick={addUser}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-semibold flex items-center gap-2 shadow-lg"
              >
                <Plus size={20} />
                Add User
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border-2 border-blue-100 shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Search className="text-blue-600" />
              Search & Filter Users
            </h2>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name or user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white"
              >
                <option value="name">Sort by Name</option>
                <option value="devices">Sort by Appliances</option>
                <option value="power">Sort by Power</option>
              </select>
              <button
                onClick={searchUsers}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg"
              >
                Search
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Users ({filteredUsers.length})</h2>
            </div>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                <User className="mx-auto text-gray-300 mb-4" size={56} />
                <p className="text-gray-600 text-lg font-medium mb-2">No users found</p>
                <p className="text-gray-500">Add a new user to get started with the dashboard.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredUsers.map(user => (
                  <div key={user._id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border-2 border-gray-100 hover:border-indigo-300 hover:shadow-xl transition-all cursor-pointer" onClick={() => setSelectedUser(user)}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shadow-md">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-lg">{user.name}</p>
                          <p className="text-gray-500 text-sm">ID: {user.username}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'user', id: user._id })}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-indigo-50 px-3 py-2 rounded-lg">
                        <Zap size={16} className="text-indigo-600" />
                        <span className="font-medium">{user.devices.length} appliance{user.devices.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 px-3 py-2 rounded-lg">
                        <TrendingUp size={16} className="text-green-600" />
                        <span className="font-medium">{user.devices.reduce((sum, d) => sum + d.usage, 0).toFixed(0)}W total power</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedUser && (
              <div className="bg-white rounded-2xl shadow-xl p-8 mt-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center justify-between">
                  Manage Appliances for {selectedUser.name}
                  <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-gray-700">
                    <X size={24} />
                  </button>
                </h2>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border-2 border-green-100 shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Plus className="text-green-600" />
                    Add New Appliance
                  </h3>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Appliance ID (optional)"
                      value={newDeviceId}
                      onChange={(e) => setNewDeviceId(e.target.value)}
                      className="w-32 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Appliance Name (e.g., Air Conditioner)"
                      value={newDeviceName}
                      onChange={(e) => setNewDeviceName(e.target.value)}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                    />
                    <input
                      type="number"
                      placeholder="Watts"
                      min="0"
                      value={newDeviceUsage}
                      onChange={(e) => setNewDeviceUsage(e.target.value)}
                      className="w-32 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                    />
                    <button
                      onClick={addDevice}
                      className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-semibold flex items-center gap-2 shadow-lg"
                    >
                      <Plus size={20} />
                      Add Appliance
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-100 shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Zap className="text-blue-600" />
                    Appliances ({selectedUser.devices.length})
                  </h3>
                  {selectedUser.devices.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <Zap className="mx-auto text-gray-300 mb-2" size={48} />
                      <p className="text-gray-500">No appliances added yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedUser.devices.map(device => (
                        <div key={device.id} className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                          {editingDevice === device.id ? (
                            <div className="flex gap-3 flex-1">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                              />
                              <input
                                type="number"
                                value={editUsage}
                                min="0"
                                onChange={(e) => setEditUsage(e.target.value)}
                                className="w-32 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                              />
                              <button
                                onClick={saveEdit}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                              >
                                <Save size={18} />
                              </button>
                              <button
                                onClick={() => setEditingDevice(null)}
                                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors shadow-sm"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-3 flex-1">
                                <div className="bg-yellow-100 p-2 rounded-lg">
                                  <Zap className="text-yellow-600" size={20} />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-800">{device.name}</span>
                                  <span className="text-xs text-gray-500">ID: {device.id}</span>
                                </div>
                                <span className="text-gray-400">•</span>
                                <span className="text-indigo-600 font-bold">{device.usage}W</span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => { setEditingDevice(device.id); setEditName(device.name); setEditUsage(device.usage); }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm({ type: 'device', id: device.id })}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  ) : currentPage === 'userDashboard' && currentUser?.role === 'user' ? (
    <UserDashboard
      setCurrentPage={setCurrentPage}
      showToast={showToast}
      currentUser={currentUser}
    />
  ) : (
    <AddAppliances
      users={currentUser?.role === 'user' ? users.filter(u => u._id === currentUser._id) : users}
      setUsers={setUsers}
      setCurrentPage={setCurrentPage}
      showToast={showToast}
      currentUser={currentUser}
    />
  );
};

export default AdminDashBoard;