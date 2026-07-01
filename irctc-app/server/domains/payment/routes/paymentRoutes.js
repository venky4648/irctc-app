import express from "express";
import {
  initiatePayment, verifyPayment, paymentWebhook, getPayment, validateCoupon
} from "../controllers/PaymentController.js";
import {
  processRefund, getRefund
} from "../controllers/RefundController.js";
import {
  getWallet, addMoney
} from "../controllers/WalletController.js";
import { protect } from "../../../shared/middleware/authMiddleware.js";

const router = express.Router();

// Payments
router.post("/initiate", protect, initiatePayment);
router.post("/verify", protect, verifyPayment);
router.post("/webhook", paymentWebhook); // Usually unauthenticated but verifies signature
router.get("/:id", protect, getPayment);

// Refunds (could be nested under payments, but keeping flat as requested)
router.post("/refunds", protect, processRefund);
router.get("/refunds/:id", protect, getRefund);

// Wallet
router.get("/wallet", protect, getWallet);
router.post("/wallet/add-money", protect, addMoney);

// Coupons
router.post("/coupon/validate", protect, validateCoupon);

export default router;
