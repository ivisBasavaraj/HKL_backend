const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerId: {
    type: String,
    trim: true
  },
  deliveryAddress: {
    type: String,
    required: true,
    trim: true
  },
  partId: {
    type: String,
    required: true,
    trim: true
  },
  vehicleDetails: {
    type: String,
    required: true,
    trim: true
  },
  driverName: {
    type: String,
    required: true,
    trim: true
  },
  driverContact: {
    type: String,
    required: true,
    trim: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true
  },
  deliveryStatus: {
    type: String,
    enum: ['Pending', 'Dispatched', 'In Transit', 'Delivered', 'Failed'],
    default: 'Pending'
  },
  deliveryProofImage: {
    type: String
  },
  remarks: {
    type: String,
    trim: true
  },
  actualDeliveryDate: {
    type: Date
  },
  managedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Delivery', deliverySchema);