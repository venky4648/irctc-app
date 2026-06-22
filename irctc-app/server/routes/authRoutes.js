import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateMyProfile,
  getAllUsersByAdmin,
  updateUserProfile,
  deleteUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
// support both register and signup paths
router.post("/register", registerUser);
router.post("/signup", registerUser);

// login routes (signin alias for convenience)
router.post("/login", loginUser);
router.post("/signin", loginUser);

// protected profile endpoints
router.get("/profile", protect, getUserProfile);
router.put("/updateprofile", protect, updateMyProfile);

// admin-only user management
router.get("/users", protect, getAllUsersByAdmin);
router.put("/user/:id", protect, updateUserProfile);
router.delete("/user/:id", protect, deleteUser);

export default router;
