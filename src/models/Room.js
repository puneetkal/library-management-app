const mongoose = require('mongoose');

const chairSchema = new mongoose.Schema({
  chairNumber: {
    type: Number,
    required: true
  },
  isOccupied: {
    type: Boolean,
    default: false
  },
  occupiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  occupiedAt: {
    type: Date,
    default: null
  },
  review: {
    rating: Number,
    comment: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: Date
  }
});

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true
  },
  chairs: [chairSchema]
}, { timestamps: true });

const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);
module.exports = Room;