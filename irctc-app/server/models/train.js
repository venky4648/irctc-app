import mongoose from "mongoose";

const trainSchema = new mongoose.Schema(
  {
    trainNumber: {
      type: String,
      required: true,
      unique: true,
    },

    trainName: {
      type: String,
      required: true,
    },

    from: {
      type: String,
      required: true,
    },

    to: {
      type: String,
      required: true,
    },

    departureTime: {
      type: String,
      required: true,
    },

    arrivalTime: {
      type: String,
      required: true,
    },

    scheduleType: {
      type: String,
      enum: ['DAILY', 'WEEKLY', 'SPECIAL'],
      default: 'DAILY'
    },

    runningDays: {
      type: [String],
      default: []
    },

    runningDates: {
      type: [String],
      default: []
    },

    classes: {
      general: {
        coachCount: { type: Number, default: 0 },
        seatsPerCoach: { type: Number, default: 0 },
        totalSeats: { type: Number, default: 0 },
        availableSeats: { type: Number, default: 0 },
        price: { type: Number, required: true },
        racCapacity: { type: Number, default: 20 },
      },
      sleeper: {
        coachCount: { type: Number, default: 0 },
        seatsPerCoach: { type: Number, default: 0 },
        totalSeats: { type: Number, default: 0 },
        availableSeats: { type: Number, default: 0 },
        price: { type: Number, required: true },
        racCapacity: { type: Number, default: 20 },
      },
      ac3: {
        coachCount: { type: Number, default: 0 },
        seatsPerCoach: { type: Number, default: 0 },
        totalSeats: { type: Number, default: 0 },
        availableSeats: { type: Number, default: 0 },
        price: { type: Number, required: true },
        racCapacity: { type: Number, default: 20 },
      },
      ac2: {
        coachCount: { type: Number, default: 0 },
        seatsPerCoach: { type: Number, default: 0 },
        totalSeats: { type: Number, default: 0 },
        availableSeats: { type: Number, default: 0 },
        price: { type: Number, required: true },
        racCapacity: { type: Number, default: 20 },
      },
      ac1: {
        coachCount: { type: Number, default: 0 },
        seatsPerCoach: { type: Number, default: 0 },
        totalSeats: { type: Number, default: 0 },
        availableSeats: { type: Number, default: 0 },
        price: { type: Number, required: true },
        racCapacity: { type: Number, default: 20 },
      },
    },
  },
  { timestamps: true }
);

const Train = mongoose.model("Train", trainSchema);

export default Train;