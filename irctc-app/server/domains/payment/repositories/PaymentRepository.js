import { pool } from "../../../shared/utils/db.js";

class PaymentRepository {
    async createPayment(client, paymentData) {
        const query = `
            INSERT INTO payments (booking_id, user_id, currency, total_amount, status, idempotency_key)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [
            paymentData.booking_id,
            paymentData.user_id,
            paymentData.currency || 'INR',
            paymentData.total_amount,
            paymentData.status || 'PENDING',
            paymentData.idempotency_key
        ];
        
        const dbClient = client || pool;
        const result = await dbClient.query(query, values);
        return result.rows[0];
    }

    async getPaymentByIdempotencyKey(idempotencyKey) {
        const query = "SELECT * FROM payments WHERE idempotency_key = $1";
        const result = await pool.query(query, [idempotencyKey]);
        return result.rows[0];
    }

    async getPaymentById(paymentId) {
        const query = "SELECT * FROM payments WHERE id = $1";
        const result = await pool.query(query, [paymentId]);
        return result.rows[0];
    }

    async updatePaymentStatus(client, paymentId, status) {
        const query = `
            UPDATE payments 
            SET status = $1, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2 
            RETURNING *
        `;
        const dbClient = client || pool;
        const result = await dbClient.query(query, [status, paymentId]);
        return result.rows[0];
    }
}

export default new PaymentRepository();
