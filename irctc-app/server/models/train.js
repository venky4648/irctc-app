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

    classes: {
      general: {
        totalSeats: {
          type: Number,
          required: true,
        },
        availableSeats: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },

      ac3: {
        totalSeats: {
          type: Number,
          required: true,
        },
        availableSeats: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },

      ac2: {
        totalSeats: {
          type: Number,
          required: true,
        },
        availableSeats: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },

      ac1: {
        totalSeats: {
          type: Number,
          required: true,
        },
        availableSeats: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    },
  },
  { timestamps: true }
);

const Train = mongoose.model("Train", trainSchema);

export default Train;