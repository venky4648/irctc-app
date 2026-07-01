import { asyncHandler } from "../../../shared/middleware/errorHandler.js";
import PaymentService from "../services/PaymentService.js";
import CouponService from "../services/CouponService.js";

export const initiatePayment = asyncHandler(async (req, res) => {
    const result = await PaymentService.initiatePayment(req.user.id, req.body);
    res.status(201).json({ success: true, ...result });
});

export const verifyPayment = asyncHandler(async (req, res) => {
    const payment = await PaymentService.verifyPayment(req.body.payment_id, req.body.verification_data);
    res.status(200).json({ success: true, payment });
});

export const paymentWebhook = asyncHandler(async (req, res) => {
    // In real life, verify webhook signature here
    const payment = await PaymentService.verifyPayment(req.body.payload.payment.entity.id, req.body.payload);
    res.status(200).send("OK");
});

export const getPayment = asyncHandler(async (req, res) => {
    const payment = await PaymentService.getPayment(req.params.id);
    // Ensure user owns this payment
    if (payment.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    res.status(200).json({ success: true, payment });
});

export const validateCoupon = asyncHandler(async (req, res) => {
    const result = await CouponService.validateCoupon(req.body.coupon_code, req.body.order_amount);
    res.status(200).json({ success: true, ...result });
});
