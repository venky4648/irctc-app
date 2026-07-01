import { pool } from "../config/db.js";

// Generate PNR
const generatePNR = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

export const checkAvailabilityAndGetAmount = async (req, res) => {
  res.status(501).json({ message: "Availability check is being migrated to Postgres." });
};

export const bookTrain = async (req, res) => {
  const client = await pool.connect();
  try {
    const { trainId, passengers, travelClass, source, destination, journeyDate } = req.body;

    await client.query('BEGIN');

    // MOCK POSTGRES IMPLEMENTATION based on the new Booking Domain schema
    // 1. Lock seats (Skipped in mock)
    // 2. Create PNR
    const pnrNumber = generatePNR();
    
    // In a real scenario, we would insert into `pnrs` here
    // const pnrResult = await client.query(`
    //   INSERT INTO pnrs (pnr_number, user_id, train_run_id, from_station_id, to_station_id, journey_date, train_class_id, quota_id, total_fare, status)
    //   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'BOOKED')
    //   RETURNING id
    // `, [...]);

    // 3. Insert Passengers
    // 4. Update Seat Allocation
    
    await client.query('COMMIT');
    
    if (req.io) {
      req.io.emit('availabilityChanged', { trainId, journeyDate });
    }

    res.status(201).json({
      success: true,
      message: "Booking confirmed successfully! (Mocked via Postgres)",
      bookingDetails: { pnrNumber, status: "confirmed" },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

export const cancelBooking = async (req, res) => {
  res.status(501).json({ message: "Cancellation is being migrated to Postgres" });
};

export const cancelPassenger = async (req, res) => {
  res.status(501).json({ message: "Passenger cancellation is being migrated to Postgres" });
};

export const getUserBookings = async (req, res) => {
  try {
    // In Postgres, this would join pnrs, passengers, and trains
    res.status(200).json({ success: true, bookings: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookingByPNR = async (req, res) => {
  try {
    const pnr = req.params.pnr;
    res.status(200).json({ success: true, bookingDetails: null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};