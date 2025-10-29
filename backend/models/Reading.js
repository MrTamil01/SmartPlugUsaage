const mongoose = require('mongoose');

const ReadingSchema = new mongoose.Schema({
  device_id: {
    type: String,
    required: true,
    ref: 'Appliance',
  },
  timestamp: {
    type: Date,
    required: true,
  },
  voltage: {
    type: Number,
    required: true,
  },
  current: {
    type: Number,
    required: true,
  },
  power: {
    type: Number,
    required: true,
  },
  energy: {
    type: Number,
    required: true,
  },
  frequency: {
    type: Number,
    required: true,
  },
  power_factor: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const Reading = mongoose.model('Reading', ReadingSchema);

module.exports = Reading;
