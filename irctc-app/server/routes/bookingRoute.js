import express from "express";
import {
  bookTrain,
  checkAvailabilityAndGetAmount,
  cancelBooking,
  getUserBookings,
  getBookingByPNR,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/check-availability", protect, checkAvailabilityAndGetAmount);
router.post("/book", protect, bookTrain);
router.delete("/cancel/:id", protect, cancelBooking);
router.get("/my-bookings", protect, getUserBookings);
router.get("/pnr/:pnr", getBookingByPNR);
export default router;
