const mongoose = require('mongoose');

const qualityControlSchema = new mongoose.Schema({
  partId: {
    type: String,
    required: true,
    trim: true
  },
  holeDimensions: {
    hole1: {
      type: Number,
      required: true
    },
    hole2: {
      type: Number,
      required: true
    },
    hole3: {
      type: Number,
      required: true
    }
  },
  levelReadings: {
    level1: {
      type: Number,
      required: true
    },
    level2: {
      type: Number,
      required: true
    },
    level3: {
      type: Number,
      required: true
    }
  },
  qcStatus: {
    type: String,
    enum: ['Pass', 'Fail'],
    required: true
  },
  inspectorName: {
    type: String,
    required: true,
    trim: true
  },
  signatureImage: {
    type: String
  },
  remarks: {
    type: String,
    trim: true
  },
  toleranceExceeded: {
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

// Auto-validate measurements against tolerance
qualityControlSchema.pre('save', function(next) {
  const holeTolerance = 0.5;
  const levelTolerance = 1.0;
  
  const holes = [this.holeDimensions.hole1, this.holeDimensions.hole2, this.holeDimensions.hole3];
  const levels = [this.levelReadings.level1, this.levelReadings.level2, this.levelReadings.level3];
  
  let exceededTolerance = false;
  
  for (let hole of holes) {
    if (hole > holeTolerance) {
      exceededTolerance = true;
      break;
    }
  }
  
  if (!exceededTolerance) {
    for (let level of levels) {
      if (level > levelTolerance) {
        exceededTolerance = true;
        break;
      }
    }
  }
  
  this.toleranceExceeded = exceededTolerance;
  this.qcStatus = exceededTolerance ? 'Fail' : 'Pass';
  
  next();
});

module.exports = mongoose.model('QualityControl', qualityControlSchema);