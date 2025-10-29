require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const connectDB = require('./config/db');
const User = require('./models/User');
const Reading = require('./models/Reading');
const Appliance = require('./models/Appliance');

let lastData = { status: "No data yet" };

// Connect to database and create default admin
const startServer = async () => {
  await connectDB();

  // Create default admin user if not exists
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
        devices: []
      });
      await admin.save();
      console.log('Default admin user created');
    }
  } catch (err) {
    console.error('Error creating default admin:', err);
  }

  // Middleware
  app.use(cors({
    origin: ['http://localhost:5173', 'http://10.37.212.245:5173', 'http://localhost:3000', 'http://10.37.212.245:3000','smart-plug-usaage.vercel.app'],
    credentials: true
  }));
  app.use(express.json());

  // IoT Device Endpoints
  // POST endpoint to receive data
  app.post('/pzem', async (req, res) => {
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

      // Increment appliance usage with power from the reading
      appliance.usage += parseFloat(power);
      await appliance.save();
      console.log(`Updated appliance ${device_id} usage to: ${appliance.usage}`);

      lastData = req.body;
      console.log("Received and stored:", lastData);
      res.json({ status: "ok", received: lastData });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

  // GET endpoint to view last data
  app.get('/pzem', (req, res) => {
    res.json(lastData);
  });

  // Routes
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/user', require('./routes/user'));
  app.use('/api/device', require('./routes/device'));

  module.exports = app;

};

startServer();

