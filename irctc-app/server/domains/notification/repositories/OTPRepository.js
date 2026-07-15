import { BaseRepository } from '../../../shared/utils/BaseRepository.js';
import { pool } from '../../../shared/utils/db.js';

class OTPRepository extends BaseRepository {
    constructor() {
        super('otp_verifications');
    }

    async createOTP(email, hash, purpose, expiresAt) {
        const result = await pool.query(
            `INSERT INTO ${this.tableName} (email, otp_hash, purpose, expires_at)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [email, hash, purpose, expiresAt]
        );
        return result.rows[0];
    }

    async getLatestUnused(email, purpose) {
        const result = await pool.query(
            `SELECT * FROM ${this.tableName} 
             WHERE email = $1 AND purpose = $2 AND is_used = false 
             ORDER BY created_at DESC LIMIT 1`,
            [email, purpose]
        );
        return result.rows[0];
    }

    async markAsUsed(id) {
        const result = await pool.query(
            `UPDATE ${this.tableName} SET is_used = true WHERE id = $1 RETURNING *`,
            [id]
        );
        return result.rows[0];
    }
}

export default new OTPRepository();
