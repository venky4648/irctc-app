import express from "express";
import { searchTrains, getTrainRunSeats, getFare, previewBooking } from "../controllers/SearchController.js";

const router = express.Router();

router.get("/trains", searchTrains);
router.get("/train-runs/:id/seats", getTrainRunSeats);
router.get("/fare", getFare);
router.post("/preview", previewBooking);

export default router;
