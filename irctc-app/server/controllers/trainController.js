import { pool } from "../config/db.js";

// Add Train
export const addTrain = async (req, res) => {
  res.status(501).json({ message: "Not implemented yet for Postgres. Requires Network & Fleet domain setup." });
};

// Get All Trains
export const getTrains = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.id, t.train_number as "trainNumber", t.name as "trainName", 
             t.status
      FROM trains t
    `);

    res.status(200).json({
      success: true,
      trains: result.rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// Search Trains
export const searchTrains = async (req, res) => {
  const { from, to, date } = req.query;

  try {
    // This is a simplified search for the new Postgres schema
    // In production, this would join train_runs, inventory_segments, and coach_availability
    
    // For now, return a mock response that matches the frontend expectation 
    // to avoid crashing while the UI is being updated for the new schema.
    res.status(200).json({
      success: true,
      trains: [],
      message: "Search functionality is being migrated to Postgres segment-based availability.",
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// Update Train
export const updateTrain = async (req, res) => {
  res.status(501).json({ message: "Not implemented yet for Postgres" });
};

// Delete Train
export const deleteTrain = async (req, res) => {
  res.status(501).json({ message: "Not implemented yet for Postgres" });
};