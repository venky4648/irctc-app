import mongoose from "mongoose";

const trainRouteSchema = new mongoose.Schema({
  train: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Train",
    required: true,
  },
  stationName: { type: String, required: true },
  arrivalDay: { type: Number, default: 1 },
  arrivalTime: { type: String, required: true },
  departureDay: { type: Number, default: 1 },
  departureTime: { type: String, required: true },
  distanceFromSource: { type: Number, default: 0 },
  stationOrder: { type: Number, required: true }
}, { timestamps: true });

const TrainRoute = mongoose.model("TrainRoute", trainRouteSchema);

export default TrainRoute;
