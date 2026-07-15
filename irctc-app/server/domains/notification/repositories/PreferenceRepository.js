import { BaseRepository } from '../../../shared/utils/BaseRepository.js';
import { pool } from '../../../shared/utils/db.js';

class PreferenceRepository extends BaseRepository {
    constructor() {
        super('notification_preferences');
    }

    async getByUserId(userId) {
        const result = await pool.query(
            `SELECT * FROM ${this.tableName} WHERE user_id = $1 LIMIT 1`,
            [userId]
        );
        return result.rows[0];
    }

    async upsert(userId, preferences) {
        const { email_enabled, in_app_enabled } = preferences;
        const result = await pool.query(
            `INSERT INTO ${this.tableName} (user_id, email_enabled, in_app_enabled, updated_at)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
             ON CONFLICT (user_id) DO UPDATE 
             SET email_enabled = EXCLUDED.email_enabled,
                 in_app_enabled = EXCLUDED.in_app_enabled,
                 updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [userId, email_enabled, in_app_enabled]
        );
        return result.rows[0];
    }
}

export default new PreferenceRepository();
