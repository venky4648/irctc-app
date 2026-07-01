import { pool } from "../../../shared/utils/db.js";

class RefundRepository {
    async createRefund(client, refundData) {
        const query = `
            INSERT INTO refunds (payment_id, refund_reason_id, total_refund_amount, cancellation_charge_applied, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [
            refundData.payment_id,
            refundData.refund_reason_id,
            refundData.total_refund_amount,
            refundData.cancellation_charge_applied || 0.00,
            refundData.status || 'INITIATED'
        ];
        
        const dbClient = client || pool;
        const result = await dbClient.query(query, values);
        return result.rows[0];
    }

    async updateRefundStatus(client, refundId, status) {
        const query = `
            UPDATE refunds 
            SET status = $1, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2 
            RETURNING *
        `;
        const dbClient = client || pool;
        const result = await dbClient.query(query, [status, refundId]);
        return result.rows[0];
    }
}

export default new RefundRepository();
