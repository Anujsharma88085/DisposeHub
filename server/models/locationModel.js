import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pickedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  lat: {
    type: Number,
    required: true,
  },
  long: {
    type: Number,
    required: true,
  },
  locationName: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: [
      "ACTIVE",
      "COMPLETED",
      "CANCELLED",
    ],
    default: "ACTIVE",
  },
}, {
  timestamps: true,
});

const Location = mongoose.model('Location', locationSchema);

export default Location;
