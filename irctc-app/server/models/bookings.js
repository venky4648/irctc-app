import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  train: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Train",
    required: true,
  },

  travelClass: {
    type: String,
    enum: ["general", "ac3", "ac2", "ac1"],
    required: true
  },

  pnrNumber: {
    type: String,
    unique: true,
  },

  passengers: [
    {
      name: { type: String, required: true },
      age: { type: Number, required: true },
      gender: { type: String, required: true },
      berthPreference: { type: String }
    },
  ],

  totalSeats: {
    type: Number,
    required: true,
  },

  totalAmount: {
    type: Number,
    required: true,
  },

  bookingStatus: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending",
  },

  bookingDate: {
    type: Date,
    default: Date.now,
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },

  paymentId: {
    type: String,
  }

},
{ timestamps: true });

export const Booking = mongoose.model("Booking", bookingSchema);