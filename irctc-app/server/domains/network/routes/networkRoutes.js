import express from "express";
import {
  createStation, getStation, searchStations, updateStation, deleteStation
} from "../controllers/StationController.js";
import {
  createRoute, getRoute, searchRoutes, updateRoute, deleteRoute
} from "../controllers/RouteController.js";
import { protect, isAdmin } from "../../../shared/middleware/authMiddleware.js";

const router = express.Router();

// Stations
router.get("/stations", searchStations);
router.get("/stations/:id", getStation);
router.post("/stations", protect, isAdmin, createStation);
router.put("/stations/:id", protect, isAdmin, updateStation);
router.delete("/stations/:id", protect, isAdmin, deleteStation);

// Routes
router.get("/routes", searchRoutes);
router.get("/routes/:id", getRoute);
router.post("/routes", protect, isAdmin, createRoute);
router.put("/routes/:id", protect, isAdmin, updateRoute);
router.delete("/routes/:id", protect, isAdmin, deleteRoute);

export default router;
