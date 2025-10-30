require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User');
const Reading = require('./models/Reading');
const Appliance = require('./models/Appliance');

const app = express();
let lastData = { status: "No data yet" };

// ✅ Allowed frontend origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://smart-plug-usaage.vercel.app',
  'https://smartplugusaage.onrender.com',
  'https://smart-plug-usaage-csxr-git-main-mrtamil01s-projects.vercel.app'
];

// ✅ Middleware (CORS → JSON → routes)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn(`❌ CORS blocked for origin: ${origin}`);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// ✅ Health check route (for Render uptime)
app.get('/', (req, res) => {
  res.send('✅ Smart Plug Backend Running Successfully');
});

// ✅ IoT Device Endpoints
app.post('/pzem', async (req, res) => {
  try {
    const { device_id, voltage, current, power, frequency, power_factor } = req.body;

    if (!device_id || voltage === undefined || current === undefined || power === undefined || frequency === undefined || power_factor === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const appliance = await Appliance.findOne({ id: device_id });
    if (!appliance) return res.status(404).json({ message: 'Device not found' });

    const newReading = new Reading({
      device_id,
      timestamp: new Date(),
      voltage: parseFloat(voltage),
      current: parseFloat(current),
      power: parseFloat(power),
      energy: 0,
      frequency: parseFloat(frequency),
      power_factor: parseFloat(power_factor),
      status: 'active',
    });

    await newReading.save();
    appliance.usage += parseFloat(power);
    await appliance.save();

    lastData = req.body;
    console.log('📡 Received:', lastData);
    res.json({ status: 'ok', received: lastData });
  } catch (err) {
    console.error('❌ /pzem error:', err.message);
    res.status(500).send('Server error');
  }
});

app.get('/pzem', (req, res) => {
  res.json(lastData);
});

// ✅ Main API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/device', require('./routes/device'));

// ✅ Connect DB and start server
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 10000;
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Server startup failed:', err.message);
  }
};

startServer();
