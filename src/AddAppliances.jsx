import React, { useState, useEffect } from 'react';

const AddAppliances = ({ setCurrentPage, showToast, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editingDevice, setEditingDevice] = useState(null);
  const [editName, setEditName] = useState('');
  const [editUsage, setEditUsage] = useState('');
  const [newDeviceNames, setNewDeviceNames] = useState({});
  const [newDeviceUsages, setNewDeviceUsages] = useState({});
  const [newDeviceIds, setNewDeviceIds] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    const endpoint = currentUser?.role === 'admin' ? `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}` : `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/user/dashboard`;
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : [data]);
        setFilteredUsers(Array.isArray(data) ? data : [data]);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term) {
      const filtered = users.filter(u => u.name.toLowerCase().includes(term.toLowerCase()) || u.username.toLowerCase().includes(term.toLowerCase()));
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
    setEditingDevice(null);
  };

  const startEdit = (device) => {
    setEditingDevice(device.id);
    setEditName(device.name);
    setEditUsage(device.usage);
  };

  const saveEdit = async (user, deviceId) => {
    if (!editName.trim()) {
      showToast('Please enter appliance name', 'error');
      return;
    }
    if (!editUsage.trim() || isNaN(parseFloat(editUsage)) || parseFloat(editUsage) <= 0) {
      showToast('Please enter valid watts (greater than 0)', 'error');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/user/update-device/${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user._id, name: editName, usage: parseFloat(editUsage) }),
      });
      if (response.ok) {
        await fetchUsers();
        setEditingDevice(null);
        showToast('Appliance updated successfully!', 'success');
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Failed to update appliance', 'error');
      }
    } catch (error) {
      console.error('Update device error:', error);
      showToast('Network error. Please try again.', 'error');
    }
  };

  const cancelEdit = () => {
    setEditingDevice(null);
  };

  const deleteDevice = async (userId, deviceId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/user/delete-device/${deviceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });
      if (response.ok) {
        await fetchUsers();
        setDeleteConfirm(null);
        showToast('Appliance deleted successfully!', 'success');
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Failed to delete appliance', 'error');
      }
    } catch (error) {
      console.error('Delete device error:', error);
      showToast('Network error. Please try again.', 'error');
    }
  };

  const addDevice = async (userId) => {
    const name = newDeviceNames[userId] || '';
    const usage = newDeviceUsages[userId] || '';
    const id = newDeviceIds[userId] ? newDeviceIds[userId].trim() : '';
    if (!name.trim()) {
      showToast('Please enter appliance name', 'error');
      return;
    }
    if (!usage.trim() || isNaN(parseFloat(usage)) || parseFloat(usage) <= 0) {
      showToast('Please enter valid watts (greater than 0)', 'error');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/user/add-device`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, name, usage: parseFloat(usage), id: id || undefined }),
      });
      if (response.ok) {
        await fetchUsers();
        setNewDeviceNames({ ...newDeviceNames, [userId]: '' });
        setNewDeviceUsages({ ...newDeviceUsages, [userId]: '' });
        setNewDeviceIds({ ...newDeviceIds, [userId]: '' });
        showToast('Appliance added successfully!', 'success');
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Failed to add appliance', 'error');
      }
    } catch (error) {
      console.error('Add device error:', error);
      showToast('Network error. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              Manage Appliances
            </h1>
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentPage(currentUser?.role === 'admin' ? 'dashboard' : 'userDashboard')}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg font-medium"
              >
                ← Back
              </button>
            </div>
          </div>

          {deleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
                <p className="mb-6">Are you sure you want to delete this appliance?</p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteDevice(deleteConfirm.userId, deleteConfirm.deviceId)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="relative mb-8">
            <input
              type="text"
              placeholder="Search by name or user ID..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors text-gray-700"
            />
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-500">No users found matching your search</p>
            </div>
          ) : (
            filteredUsers.map(user => (
              <div key={user._id} className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 mb-6 border-2 border-indigo-100 shadow-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{user.name}</h3>
                    <p className="text-gray-600">ID: {user.username}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                  <h4 className="font-semibold text-gray-700 mb-3">Add New Appliance</h4>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Appliance ID (optional)"
                      value={newDeviceIds[user._id] || ''}
                      onChange={(e) => setNewDeviceIds({ ...newDeviceIds, [user._id]: e.target.value })}
                      className="w-32 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Device Name"
                      value={newDeviceNames[user._id] || ''}
                      onChange={(e) => setNewDeviceNames({ ...newDeviceNames, [user._id]: e.target.value })}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                    />
                    <input
                      type="number"
                      placeholder="Watts"
                      value={newDeviceUsages[user._id] || ''}
                      onChange={(e) => setNewDeviceUsages({ ...newDeviceUsages, [user._id]: e.target.value })}
                      className="w-32 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                    />
                    <button
                      onClick={() => addDevice(user._id)}
                      className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md flex items-center gap-2 font-medium"
                    >
                      Add Device
                    </button>
                  </div>
                </div>

                <ul>
                  {user.devices.map(device => (
                    <li key={device.id} className="mb-2">
                      {editingDevice === device.id ? (
                        <div className="flex gap-3 items-center">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                          />
                          <input
                            type="number"
                            value={editUsage}
                            onChange={(e) => setEditUsage(e.target.value)}
                            className="w-32 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                          />
                          <button
                            onClick={() => saveEdit(user, device.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors shadow-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span><strong>ID:</strong> {device.id} - {device.name} - {device.usage} Watts</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(device)}
                              className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ userId: user._id, deviceId: device.id })}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AddAppliances;
