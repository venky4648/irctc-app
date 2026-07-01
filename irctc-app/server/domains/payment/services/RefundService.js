import { pool } from "../../../shared/utils/db.js";
import { logger } from "../../../shared/utils/logger.js";
import RefundRepository from "../repositories/RefundRepository.js";
import PaymentRepository from "../repositories/PaymentRepository.js";
import LedgerService from "./LedgerService.js";

class RefundService {
    async processRefund(userId, refundData) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            
            const payment = await PaymentRepository.getPaymentById(refundData.payment_id);
            if (!payment || payment.status !== 'SUCCESS') {
                throw new Error("Invalid or unverified payment for refund");
            }

            // 1. Calculate Cancellation Fees (Mocked)
            const cancellationCharge = refundData.cancellation_charge_applied || 0;
            const refundAmount = parseFloat(payment.total_amount) - cancellationCharge;

            if (refundAmount < 0) {
                throw new Error("Cancellation charge exceeds payment amount");
            }

            // 2. Create Refund Record
            const refund = await RefundRepository.createRefund(client, {
                payment_id: payment.id,
                refund_reason_id: refundData.refund_reason_id,
                total_refund_amount: refundAmount,
                cancellation_charge_applied: cancellationCharge,
                status: 'COMPLETED' // Fast-forwarding for simulation
            });

            // 3. Double-Entry Accounting
            if (refundAmount > 0) {
                await LedgerService.postLedgerEntry(client, 
                    { type: 'ASSET', name: 'Gateway_Clearing' }, // Credit Asset (Gateway owes us less / we gave it back)
                    { type: 'REVENUE', name: 'Ticket_Sales' },   // Debit Revenue (Reversing the sale)
                    refundAmount, 
                    refund.id
                );
            }

            if (cancellationCharge > 0) {
                await LedgerService.postLedgerEntry(client,
                    { type: 'REVENUE', name: 'Cancellation_Fees' }, // Credit Revenue (We earned fee)
                    { type: 'REVENUE', name: 'Ticket_Sales' },      // Debit Revenue (Offsetting original ticket price)
                    cancellationCharge,
                    refund.id
                );
            }

            await client.query("COMMIT");
            logger.info("Refund Completed", { refundId: refund.id, amount: refundAmount });
            
            return refund;
        } catch (error) {
            await client.query("ROLLBACK");
            logger.error("Refund Failed", { error: error.message });
            throw error;
        } finally {
            client.release();
        }
    }

    async getRefund(refundId) {
        // Simple mock for GET
        return { id: refundId, status: 'COMPLETED' };
    }
}

export default new RefundService();
