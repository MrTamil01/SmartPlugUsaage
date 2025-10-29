const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Appliance = require('../models/Appliance');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token and set req.user
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// GET /api/user/dashboard - get current user's details including devices
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const appliances = await Appliance.find({ userId: req.user.id });
    const userWithAppliances = {
      ...user.toObject(),
      devices: appliances.map(appliance => ({
        id: appliance.id,
        name: appliance.name,
        usage: appliance.usage,
      })),
    };
    res.json(userWithAppliances);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET /api/user/admin-dashboard - get all users and their devices for admin
router.get('/admin-dashboard', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const users = await User.find().select('-password');
    const usersWithAppliances = await Promise.all(
      users.map(async (user) => {
        const appliances = await Appliance.find({ userId: user._id });
        return {
          ...user.toObject(),
          devices: appliances.map(appliance => ({
            id: appliance.id,
            name: appliance.name,
            usage: appliance.usage,
          })),
        };
      })
    );
    res.json(usersWithAppliances);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST /api/user/add-device - add a device to a user (admin only)
router.post('/add-device', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { userId, deviceId, name, usage, id } = req.body;
    if (!userId || !name || !usage) {
      return res.status(400).json({ message: 'User ID, name, and usage are required' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Check if device ID is unique across all appliances
    const existingAppliance = await Appliance.findOne({ id: id || deviceId });
    if (existingAppliance) {
      return res.status(400).json({ message: 'Device ID must be unique' });
    }
    const newAppliance = new Appliance({
      id: id || deviceId || (Date.now() + Math.random()).toString(),
      name,
      usage: parseFloat(usage),
      userId,
    });
    await newAppliance.save();
    res.json({ message: 'Device added successfully', device: { id: newAppliance.id, name: newAppliance.name, usage: newAppliance.usage } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// PUT /api/user/update-device/:deviceId - update a device (admin only)
router.put('/update-device/:deviceId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { deviceId } = req.params;
    const { userId, name, usage } = req.body;
    if (!userId || !name || !usage) {
      return res.status(400).json({ message: 'User ID, name, and usage are required' });
    }
    const appliance = await Appliance.findOne({ id: deviceId, userId });
    if (!appliance) {
      return res.status(404).json({ message: 'Device not found' });
    }
    appliance.name = name;
    appliance.usage = parseFloat(usage);
    await appliance.save();
    res.json({ message: 'Device updated successfully', device: { id: appliance.id, name: appliance.name, usage: appliance.usage } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// DELETE /api/user/delete-device/:deviceId - delete a device (admin only)
router.delete('/delete-device/:deviceId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { deviceId } = req.params;
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const appliance = await Appliance.findOneAndDelete({ id: deviceId, userId });
    if (!appliance) {
      return res.status(404).json({ message: 'Device not found' });
    }
    res.json({ message: 'Device deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// DELETE /api/user/:userId - delete a user and all their appliances (admin only)
router.delete('/:userId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Delete all appliances associated with the user
    await Appliance.deleteMany({ userId });
    // Delete the user
    await User.findByIdAndDelete(userId);
    res.json({ message: 'User and all associated appliances deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
