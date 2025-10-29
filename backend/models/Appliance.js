const mongoose = require('mongoose');

const ApplianceSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  usage: {
    type: Number,
    required: true,
  },
  device_id: {
    type: String,
    required: false,
  },
  voltage: {
    type: Number,
    required: false,
  },
  current: {
    type: Number,
    required: false,
  },
  power: {
    type: Number,
    required: false,
  },
  frequency: {
    type: Number,
    required: false,
  },
  power_factor: {
    type: Number,
    required: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

const Appliance = mongoose.model('Appliance', ApplianceSchema);

module.exports = Appliance;
