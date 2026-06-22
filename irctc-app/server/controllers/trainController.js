import Train from "../models/train.js";

// Add Train
export const addTrain = async (req, res) => {
  try {
    const {
      trainNumber,
      trainName,
      from,
      to,
      departureTime,
      arrivalTime,
      classes,
    } = req.body;

    const train = await Train.create({
      trainNumber,
      trainName,
      from,
      to,
      departureTime,
      arrivalTime,
      classes,
    });

    res.status(201).json({
      success: true,
      train,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// Get All Trains
export const getTrains = async (req, res) => {
  try {
    const trains = await Train.find({}).lean();

    res.status(200).json({
      success: true,
      trains,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// Search Trains
export const searchTrains = async (req, res) => {
  const { from, to } = req.query;

  try {
    const trains = await Train.find({
      from: { $regex: from, $options: "i" },
      to: { $regex: to, $options: "i" },
    }).lean();

    if (trains.length === 0) {
      return res.status(404).json({
        message: "No trains found for the specified route",
      });
    }

    res.status(200).json({
      success: true,
      trains,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};