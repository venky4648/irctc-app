import express from "express";
import {
  createBooking,
  getBookingByPNR
} from "../controllers/BookingController.js";
import { protect } from "../../../shared/middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/pnr/:pnrNumber", protect, getBookingByPNR);

export default router;
