import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateMyProfile,
  updateUserProfile,
  deleteUser,
  getAllUsersByAdmin
} from "../controllers/AuthController.js";
import { protect, isAdmin } from "../../../shared/middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes (User)
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateMyProfile);

// Protected routes (Admin)
router.put("/:id", protect, isAdmin, updateUserProfile);
router.delete("/:id", protect, isAdmin, deleteUser);
router.get("/", protect, isAdmin, getAllUsersByAdmin);

export default router;
