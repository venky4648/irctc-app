import express from "express";
import { addTrain, getTrains, searchTrains, updateTrain, deleteTrain } from "../controllers/trainController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", protect, isAdmin, addTrain);
router.put("/:id", protect, isAdmin, updateTrain);
router.delete("/:id", protect, isAdmin, deleteTrain);
router.get("/all", getTrains);
router.get("/search", searchTrains);
router.get("/test", (req, res) => res.json({ msg: "SERVER IS UPDATED" }));

export default router;