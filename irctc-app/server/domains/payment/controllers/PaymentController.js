import { asyncHandler } from "../../../shared/middleware/errorHandler.js";
import PaymentService from "../services/PaymentService.js";
import CouponService from "../services/CouponService.js";

export const initiatePayment = asyncHandler(async (req, res) => {
    const result = await PaymentService.initiatePayment(req.user.id, req.body);
    res.status(201).json({ success: true, ...result });
});

import BookingService from "../../booking/services/BookingService.js";

export const verifyPayment = asyncHandler(async (req, res) => {
    // req.body should contain { payment_id, verification_data: { razorpay_order_id, razorpay_payment_id, razorpay_signature }, booking_data }
    const payment = await PaymentService.verifyPayment(req.body.payment_id, req.body.verification_data);
    
    // If verification succeeded and it's marked SUCCESS
    if (payment.status === 'SUCCESS' && req.body.booking_data) {
        // Now create the booking
        const bookingResult = await BookingService.createBooking(req.user, req.body.booking_data);
        
        // Link the booking ID to the payment
        // (In a complete system, we would update the payment record with bookingResult.bookingDetails.id, but this is a solid start)
        
        return res.status(200).json({ success: true, payment, bookingDetails: bookingResult.bookingDetails });
    } else {
        return res.status(400).json({ success: false, message: "Payment verification failed" });
    }
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
