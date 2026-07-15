import { pool } from '../../../shared/utils/db.js';

export const getAllTrains = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM trains ORDER BY created_at DESC');
    res.json({ success: true, trains: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTrain = async (req, res) => {
  const { train_number, name, departure_time, arrival_time } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO trains (train_number, name, departure_time, arrival_time) VALUES ($1, $2, $3, $4) RETURNING *',
      [train_number, name, departure_time, arrival_time]
    );
    res.json({ success: true, train: rows[0], message: 'Train added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTrainRoutes = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM train_routes WHERE train_id = $1 ORDER BY halt_order ASC',
      [req.params.id]
    );
    res.json({ success: true, routes: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTrainRoutes = async (req, res) => {
  const trainId = req.params.id;
  const { routes } = req.body; // array of { halt_order, station_name, arrival_time, departure_time }
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Clear old routes
    await client.query('DELETE FROM train_routes WHERE train_id = $1', [trainId]);
    
    // Insert new routes
    for (const r of routes) {
      await client.query(
        'INSERT INTO train_routes (train_id, halt_order, station_name, arrival_time, departure_time) VALUES ($1, $2, $3, $4, $5)',
        [trainId, r.halt_order, r.station_name, r.arrival_time, r.departure_time]
      );
    }
    
    await client.query('COMMIT');
    res.json({ success: true, message: 'Routes updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};
