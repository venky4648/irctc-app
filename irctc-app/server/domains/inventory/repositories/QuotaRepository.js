import { pool } from "../../../shared/utils/db.js";

class QuotaRepository {
    async checkQuotaAvailability(quotaId, classId, trainRunId, startSegment, endSegment) {
        // Query available seats dynamically from seat_inventory based on segments
        const query = `
            SELECT COUNT(si.id)::int as available_seats
            FROM seat_inventory si
            JOIN coach_inventory c ON si.coach_inventory_id = c.id
            WHERE c.train_run_id = $1 AND c.class_id = $2
            AND NOT EXISTS (
                SELECT 1 FROM seat_allocation sa 
                WHERE sa.seat_inventory_id = si.id 
                AND int4range(sa.start_segment_seq, sa.end_segment_seq) && int4range($3, $4)
            )
        `;
        const result = await pool.query(query, [trainRunId, classId, startSegment, endSegment]);
        return { available_seats: result.rows[0]?.available_seats || 0 };
    }
}

export default new QuotaRepository();
