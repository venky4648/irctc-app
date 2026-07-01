import express from "express";
import {
  createTrain, getTrain, searchTrains, updateTrain, deleteTrain
} from "../controllers/TrainController.js";
import {
  createCoach, getCoach, searchCoaches, updateCoach, deleteCoach
} from "../controllers/CoachController.js";
import {
  createSchedule, getSchedule, searchSchedules, updateSchedule, deleteSchedule
} from "../controllers/ScheduleController.js";
import { protect, isAdmin } from "../../../shared/middleware/authMiddleware.js";

const router = express.Router();

// Trains
router.get("/trains", searchTrains);
router.get("/trains/:id", getTrain);
router.post("/trains", protect, isAdmin, createTrain);
router.put("/trains/:id", protect, isAdmin, updateTrain);
router.delete("/trains/:id", protect, isAdmin, deleteTrain);

// Coaches
router.get("/coaches", searchCoaches);
router.get("/coaches/:id", getCoach);
router.post("/coaches", protect, isAdmin, createCoach);
router.put("/coaches/:id", protect, isAdmin, updateCoach);
router.delete("/coaches/:id", protect, isAdmin, deleteCoach);

// Schedules
router.get("/schedules", searchSchedules);
router.get("/schedules/:train_id/:station_id", getSchedule);
router.post("/schedules", protect, isAdmin, createSchedule);
router.put("/schedules/:train_id/:station_id", protect, isAdmin, updateSchedule);
router.delete("/schedules/:train_id/:station_id", protect, isAdmin, deleteSchedule);

export default router;
