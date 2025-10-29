const express = require('express');
const router = express.Router();
const Reading = require('../models/Reading');
const Appliance = require('../models/Appliance');
const jwt = require('jsonwebtoken');

let lastData = { status: "No data yet" };

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

// POST /api/device/data - receive data from ESP8266 and store reading
router.post('/data', async (req, res) => {
  try {
    const { device_id, timestamp, voltage, current, power, energy, frequency, power_factor, status } = req.body;

    // Validate required fields
    if (!device_id || !timestamp || voltage === undefined || current === undefined || power === undefined || energy === undefined || frequency === undefined || power_factor === undefined || !status) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if device exists
    const appliance = await Appliance.findOne({ id: device_id });
    if (!appliance) {
      return res.status(404).json({ message: 'Device not found' });
    }

    // Update appliance with latest readings
    await Appliance.findOneAndUpdate(
      { id: device_id },
      {
        device_id,
        voltage: parseFloat(voltage),
        current: parseFloat(current),
        power: parseFloat(power),
        frequency: parseFloat(frequency),
        power_factor: parseFloat(power_factor),
      }
    );

    // Create new reading
    const newReading = new Reading({
      device_id,
      timestamp: new Date(timestamp),
      voltage: parseFloat(voltage),
      current: parseFloat(current),
      power: parseFloat(power),
      energy: parseFloat(energy),
      frequency: parseFloat(frequency),
      power_factor: parseFloat(power_factor),
      status,
    });

    await newReading.save();
    res.json({ message: 'Reading stored successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST endpoint to receive data from IoT device (like the provided code)
router.post('/pzem', async (req, res) => {
  try {
    const { device_id, voltage, current, power, frequency, power_factor } = req.body;

    // Validate required fields
    if (!device_id || voltage === undefined || current === undefined || power === undefined || frequency === undefined || power_factor === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if device exists
    const appliance = await Appliance.findOne({ id: device_id });
    if (!appliance) {
      return res.status(404).json({ message: 'Device not found' });
    }

    // Update appliance with latest readings
    await Appliance.findOneAndUpdate(
      { id: device_id },
      {
        device_id,
        voltage: parseFloat(voltage),
        current: parseFloat(current),
        power: parseFloat(power),
        frequency: parseFloat(frequency),
        power_factor: parseFloat(power_factor),
      }
    );

    const newReading = new Reading({
      device_id,
      timestamp: new Date(),
      voltage: parseFloat(voltage),
      current: parseFloat(current),
      power: parseFloat(power),
      energy: 0, // Default since not provided
      frequency: parseFloat(frequency),
      power_factor: parseFloat(power_factor),
      status: 'active', // Default status
    });

    await newReading.save();

    lastData = req.body;
    console.log("Received and stored:", lastData);
    res.json({ status: "ok", received: lastData });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET endpoint to view last data from IoT device
router.get('/pzem', (req, res) => {
  res.json(lastData);
});

// GET /api/device/readings/:deviceId - get readings for a device (authenticated users only, must own the device)
router.get('/readings/:deviceId', auth, async (req, res) => {
  try {
    const { deviceId } = req.params;

    // Check if device exists and belongs to user
    const appliance = await Appliance.findOne({ id: deviceId, userId: req.user.id });
    if (!appliance) {
      return res.status(404).json({ message: 'Device not found or access denied' });
    }

    // Get readings for the device
    const readings = await Reading.find({ device_id: deviceId }).sort({ timestamp: -1 });
    res.json(readings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
