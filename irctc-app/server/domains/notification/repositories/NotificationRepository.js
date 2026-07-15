import { BaseRepository } from '../../../shared/utils/BaseRepository.js';
import { pool } from '../../../shared/utils/db.js';

class NotificationRepository extends BaseRepository {
    constructor() {
        super('notifications');
    }

    async getByUserId(userId, limit = 50) {
        const result = await pool.query(
            `SELECT * FROM ${this.tableName} WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
            [userId, limit]
        );
        return result.rows;
    }

    async getUnreadByUserId(userId) {
        const result = await pool.query(
            `SELECT * FROM ${this.tableName} WHERE user_id = $1 AND is_read = false ORDER BY created_at DESC`,
            [userId]
        );
        return result.rows;
    }

    async markAsRead(id, userId) {
        const result = await pool.query(
            `UPDATE ${this.tableName} SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *`,
            [id, userId]
        );
        return result.rows;
    }

    async markAllAsRead(userId) {
        const result = await pool.query(
            `UPDATE ${this.tableName} SET is_read = true WHERE user_id = $1 AND is_read = false RETURNING *`,
            [userId]
        );
        return result.rows;
    }
}

export default new NotificationRepository();
