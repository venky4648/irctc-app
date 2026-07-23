import { pool } from "../../../shared/utils/db.js";
import { logger } from "../../../shared/utils/logger.js";
import PaymentRepository from "../repositories/PaymentRepository.js";
import TransactionRepository from "../repositories/TransactionRepository.js";
import LedgerService from "./LedgerService.js";
import crypto from "crypto";
import Razorpay from "razorpay";

class PaymentService {
    
    getRazorpayInstance() {
        return new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET
        });
    }

    async createRazorpayOrder(amount, receipt) {
        const rzp = this.getRazorpayInstance();
        const options = {
            amount: Math.round(amount * 100), // amount in paise
            currency: 'INR',
            receipt: receipt || `rcpt_${Date.now()}`
        };
        return await rzp.orders.create(options);
    }

    verifyRazorpaySignature(orderId, paymentId, signature) {
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(orderId + "|" + paymentId)
            .digest('hex');
        
        return generatedSignature === signature;
    }

    async initiatePayment(userId, paymentData) {
        // Enforce idempotency key from client, or fallback to generating one
        const idempotencyKey = paymentData.idempotency_key || crypto.randomUUID();
        
        // 1. Check idempotency
        const existingPayment = await PaymentRepository.getPaymentByIdempotencyKey(idempotencyKey);
        if (existingPayment) {
            return existingPayment;
        }

        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            
            // Generate Razorpay order
            const rzpOrder = await this.createRazorpayOrder(paymentData.total_amount, `rcpt_${Date.now()}`);

            // 2. Create Payment Record
            const payment = await PaymentRepository.createPayment(client, {
                booking_id: paymentData.booking_id || null, // Might not exist yet if we book post-payment
                user_id: userId,
                total_amount: paymentData.total_amount,
                idempotency_key: idempotencyKey,
                status: 'PENDING'
            });

            // 3. Create Transaction Record
            const transaction = await TransactionRepository.createTransaction(client, {
                payment_id: payment.id,
                gateway_id: rzpOrder.id, // Store razorpay order id here
                amount: paymentData.total_amount,
                status: 'INITIATED'
            });

            await client.query("COMMIT");
            logger.info("Payment Initiated", { paymentId: payment.id, rzpOrderId: rzpOrder.id });
            
            return {
                payment,
                transaction,
                order_id: rzpOrder.id
            };
        } catch (error) {
            await client.query("ROLLBACK");
            logger.error("Payment Initiation Failed", { error: error, message: error.message, stack: error.stack });
            throw error;
        } finally {
            client.release();
        }
    }

    async verifyPayment(paymentId, verificationData) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            
            const payment = await PaymentRepository.getPaymentById(paymentId);
            if (!payment) {
                throw new Error("Payment not found");
            }
            if (payment.status === 'SUCCESS') {
                await client.query("ROLLBACK");
                return payment; // Already verified
            }

            // 1. Verify Razorpay Signature
            const isSuccess = this.verifyRazorpaySignature(
                verificationData.razorpay_order_id, 
                verificationData.razorpay_payment_id, 
                verificationData.razorpay_signature
            );
            
            if (isSuccess) {
                // Fetch payment details from Razorpay to get the exact method used (UPI, card, etc.)
                let methodId = null;
                try {
                    const rzp = this.getRazorpayInstance();
                    const rzpPayment = await rzp.payments.fetch(verificationData.razorpay_payment_id);
                    if (rzpPayment && rzpPayment.method) {
                        methodId = rzpPayment.method; // e.g. "upi", "card", "netbanking"
                    }
                } catch (fetchErr) {
                    logger.error("Failed to fetch Razorpay payment details", { error: fetchErr.message });
                }

                // 2. Update Payment Status
                await PaymentRepository.updatePaymentStatus(client, paymentId, 'SUCCESS');
                await TransactionRepository.updateTransactionStatus(
                    client, 
                    verificationData.transaction_id, 
                    'SUCCESS', 
                    null, 
                    null, 
                    verificationData.razorpay_payment_id, 
                    methodId
                );
                
                // 3. Double-Entry Accounting
                await LedgerService.postLedgerEntry(client, 
                    { type: 'REVENUE', name: 'Ticket_Sales' }, 
                    { type: 'ASSET', name: 'Gateway_Clearing' }, 
                    payment.total_amount, 
                    paymentId
                );
                
                logger.info("Payment Success", { paymentId });
            } else {
                await PaymentRepository.updatePaymentStatus(client, paymentId, 'FAILED');
                await TransactionRepository.updateTransactionStatus(
                    client, verificationData.transaction_id, 'FAILED', 'GW_ERR_01', 'User cancelled'
                );
                logger.info("Payment Failed", { paymentId });
            }

            await client.query("COMMIT");
            return await PaymentRepository.getPaymentById(paymentId);
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async getPayment(paymentId) {
        const payment = await PaymentRepository.getPaymentById(paymentId);
        if (!payment) {
            const err = new Error("Payment not found");
            err.statusCode = 404;
            throw err;
        }
        return payment;
    }

    calculateDynamicFare(baseFare, distanceKm, classCode, quotaCode, availableSeats, totalSeats) {
        let finalFare = baseFare;

        // 1. Distance Multiplier (simulated)
        if (distanceKm > 500) finalFare += (distanceKm - 500) * 1.5;

        // 2. Class Multiplier
        const classMultipliers = { '1A': 4, '2A': 2.5, '3A': 1.8, 'CC': 1.5, 'SL': 1.0, '2S': 0.6 };
        finalFare *= (classMultipliers[classCode] || 1.0);

        // 3. Quota Premium
        if (quotaCode === 'TQ') finalFare *= 1.3; // Tatkal premium

        // 4. Dynamic Surge (if less than 20% seats available)
        const occupancy = (totalSeats - availableSeats) / totalSeats;
        if (occupancy > 0.8) {
            finalFare *= 1.15; // 15% surge
        }

        // 5. Taxes (5% GST)
        finalFare *= 1.05;

        return Math.round(finalFare);
    }
}

export default new PaymentService();
