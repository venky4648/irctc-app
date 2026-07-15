import { pool } from "../../../shared/utils/db.js";
import { logger } from "../../../shared/utils/logger.js";
import PaymentRepository from "../repositories/PaymentRepository.js";
import TransactionRepository from "../repositories/TransactionRepository.js";
import LedgerService from "./LedgerService.js";
import crypto from "crypto";

class PaymentService {
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
            
            // 2. Create Payment Record
            const payment = await PaymentRepository.createPayment(client, {
                booking_id: paymentData.booking_id,
                user_id: userId,
                total_amount: paymentData.total_amount,
                idempotency_key: idempotencyKey,
                status: 'PENDING'
            });

            // 3. Create Transaction Record
            const transaction = await TransactionRepository.createTransaction(client, {
                payment_id: payment.id,
                gateway_id: paymentData.gateway_id,
                amount: paymentData.total_amount,
                status: 'INITIATED'
            });

            await client.query("COMMIT");
            logger.info("Payment Initiated", { paymentId: payment.id, idempotencyKey });
            
            return {
                payment,
                transaction,
                // Normally return a payment URL or gateway order ID here
                gateway_url: `https://mock-gateway.com/pay/${transaction.id}`
            };
        } catch (error) {
            await client.query("ROLLBACK");
            logger.error("Payment Initiation Failed", { error: error.message });
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

            // 1. Mock Verification Logic
            const isSuccess = verificationData.status === 'SUCCESS';
            
            if (isSuccess) {
                // 2. Update Payment Status
                await PaymentRepository.updatePaymentStatus(client, paymentId, 'SUCCESS');
                await TransactionRepository.updateTransactionStatus(client, verificationData.transaction_id, 'SUCCESS');
                
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
