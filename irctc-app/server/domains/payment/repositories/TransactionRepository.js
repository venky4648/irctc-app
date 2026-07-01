import { pool } from "../../../shared/utils/db.js";

class TransactionRepository {
    async createTransaction(client, transactionData) {
        const query = `
            INSERT INTO payment_transactions (payment_id, gateway_id, method_id, gateway_transaction_id, amount, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [
            transactionData.payment_id,
            transactionData.gateway_id || null,
            transactionData.method_id || null,
            transactionData.gateway_transaction_id || null,
            transactionData.amount,
            transactionData.status || 'INITIATED'
        ];
        
        const dbClient = client || pool;
        const result = await dbClient.query(query, values);
        return result.rows[0];
    }

    async updateTransactionStatus(client, transactionId, status, errorCode = null, errorMessage = null) {
        const query = `
            UPDATE payment_transactions 
            SET status = $1, error_code = $2, error_message = $3, 
                completed_at = CASE WHEN $1 IN ('SUCCESS', 'FAILED') THEN CURRENT_TIMESTAMP ELSE completed_at END
            WHERE id = $4 
            RETURNING *
        `;
        const dbClient = client || pool;
        const result = await dbClient.query(query, [status, errorCode, errorMessage, transactionId]);
        return result.rows[0];
    }
}

export default new TransactionRepository();
