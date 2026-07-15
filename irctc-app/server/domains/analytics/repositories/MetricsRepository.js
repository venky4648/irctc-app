import { pool } from "../../../shared/utils/db.js";

class MetricsRepository {
    async getDailyRevenue(dateStr) {
        const query = `
            SELECT COALESCE(SUM(total_fare), 0) as revenue
            FROM pnr
            WHERE DATE(journey_date) = $1 AND status != 'CANCELLED'
        `;
        const result = await pool.query(query, [dateStr]);
        return parseFloat(result.rows[0].revenue);
    }

    async getActiveBookingsCount() {
        const query = `
            SELECT COUNT(id) as count
            FROM pnr
            WHERE status IN ('BOOKED', 'WAITLISTED')
        `;
        const result = await pool.query(query);
        return parseInt(result.rows[0].count, 10);
    }

    async getSystemLoad() {
        // Mock query for system load (active users/sessions)
        const query = `
            SELECT COUNT(id) as count
            FROM auth_sessions
            WHERE is_active = TRUE AND expires_at > NOW()
        `;
        try {
            const result = await pool.query(query);
            return parseInt(result.rows[0].count, 10);
        } catch (err) {
            // Fallback if auth_sessions is not populated yet
            return 0;
        }
    }
}

export default new MetricsRepository();
