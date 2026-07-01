import { pool } from "../../../shared/utils/db.js";

class WalletRepository {
    async getWalletByUserId(userId) {
        const query = "SELECT * FROM wallets WHERE user_id = $1";
        const result = await pool.query(query, [userId]);
        return result.rows[0];
    }

    async getWalletForUpdate(client, userId) {
        const query = "SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE";
        const dbClient = client || pool;
        const result = await dbClient.query(query, [userId]);
        return result.rows[0];
    }

    async createWallet(client, userId) {
        const query = `
            INSERT INTO wallets (user_id, balance) 
            VALUES ($1, 0.00) 
            ON CONFLICT (user_id) DO NOTHING 
            RETURNING *
        `;
        const dbClient = client || pool;
        const result = await dbClient.query(query, [userId]);
        return result.rows[0];
    }

    async updateBalance(client, userId, newBalance) {
        const query = `
            UPDATE wallets 
            SET balance = $1, updated_at = CURRENT_TIMESTAMP 
            WHERE user_id = $2 
            RETURNING *
        `;
        const dbClient = client || pool;
        const result = await dbClient.query(query, [newBalance, userId]);
        return result.rows[0];
    }
}

export default new WalletRepository();
