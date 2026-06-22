import express from "express";
import { addTrain, getTrains,searchTrains} from "../controllers/trainController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", protect, isAdmin, addTrain);
router.get("/all",getTrains);
router.get("/search",searchTrains);

export default router;