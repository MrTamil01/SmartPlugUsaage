require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User');
const Reading = require('./models/Reading');
const Appliance = require('./models/Appliance');

const app = express();
app.use(express.json());

// ✅ CORS
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://smart-plug-usaage.vercel.app'
    ],
    credentials: true,
  })
);

// ✅ Connect DB (runs once per serverless cold start)
connectDB();

// ✅ Create default admin (only runs once per cold start)
(async () => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
        devices: [],
      });
      await admin.save();
      console.log('Default admin created ✅');
    }
  } catch (err) {
    console.error('Error creating default admin:', err.message);
  }
})();

// ✅ IoT route
let lastData = { status: "No data yet" };

app.post('/pzem', async (req, res) => {
  try {
    const { device_id, voltage, current, power, frequency, power_factor } = req.body;
    if (!device_id || voltage === undefined) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const appliance = await Appliance.findOne({ id: device_id });
    if (!appliance) return res.status(404).json({ message: 'Device not found' });

    const newReading = new Reading({
      device_id,
      timestamp: new Date(),
      voltage,
      current,
      power,
      frequency,
      power_factor,
      status: 'active',
    });
    await newReading.save();

    appliance.usage += parseFloat(power);
    await appliance.save();

    lastData = req.body;
    res.json({ status: 'ok', received: lastData });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.get('/pzem', (req, res) => res.json(lastData));

// ✅ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/device', require('./routes/device'));


module.exports = app;
