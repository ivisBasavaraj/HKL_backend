const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema({
  unitNumber: {
    type: Number,
    required: true
  },
  componentName: {
    type: String,
    required: true,
    trim: true
  },
  supplierDetails: {
    type: String,
    trim: true
  },
  imagePath: {
    type: String
  },
  remarks: {
    type: String,
    trim: true
  },
  timerEvents: [{
    eventType: {
      type: String,
      enum: ['start', 'pause', 'resume', 'stop'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    pauseRemark: {
      type: String,
      trim: true
    }
  }],
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  duration: {
    type: String // Format: "HH:MM:SS"
  },
  totalPauseTime: {
    type: Number,
    default: 0 // in milliseconds
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  inspectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Inspection', inspectionSchema);