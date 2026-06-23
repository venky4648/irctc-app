import mongoose from "mongoose";

const seatOccupancySchema = new mongoose.Schema({
  trainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Train",
    required: true,
  },
  journeyDate: {
    type: String, // e.g. YYYY-MM-DD
    required: true,
  },
  travelClass: {
    type: String,
    enum: ["general", "ac3", "ac2", "ac1"],
    required: true,
  },
  seatNumber: {
    type: Number,
    required: true,
  },
  coach: {
    type: String,
    required: true,
  },
  segmentIndex: {
    type: Number,
    required: true,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  }
}, { timestamps: true });

// Create a compound index for fast availability checks
seatOccupancySchema.index({ trainId: 1, journeyDate: 1, travelClass: 1, segmentIndex: 1 });

export const SeatOccupancy = mongoose.model("SeatOccupancy", seatOccupancySchema);
