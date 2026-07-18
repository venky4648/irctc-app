import express from "express";
import {
  createBooking,
  getBookingByPNR,
  getMyBookings,
  cancelBooking,
  cancelPassenger
} from "../controllers/BookingController.js";
import { protect } from "../../../shared/middleware/authMiddleware.js";

const router = express.Router();

router.get("/my-bookings", protect, getMyBookings);
router.post("/", protect, createBooking);
router.get("/pnr/:pnrNumber", protect, getBookingByPNR);
router.delete("/:id", protect, cancelBooking);
router.delete("/:bookingId/passenger/:passengerId", protect, cancelPassenger);

export default router;
