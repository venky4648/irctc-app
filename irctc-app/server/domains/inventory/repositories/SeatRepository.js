import { pool } from "../../../shared/utils/db.js";

class SeatRepository {
    async findAvailableSeats(client, trainRunId, classId, quotaId, startSegment, endSegment, requiredSeats) {
        // Find physically vacant seats by excluding those that overlap in seat_allocation or seat_lock
        // Note: For simplicity in this mock, we just return mock IDs if they exist.
        // Real logic would join coach_inventory, seat_inventory and exclude active locks.
        const query = `
            SELECT si.id as seat_inventory_id, si.seat_number, c.coach_id
            FROM seat_inventory si
            JOIN coach_inventory c ON si.coach_inventory_id = c.id
            WHERE c.train_run_id = $1 AND c.class_id = $2
            AND NOT EXISTS (
                SELECT 1 FROM seat_allocation sa 
                WHERE sa.seat_inventory_id = si.id 
                AND int4range(sa.start_segment_seq, sa.end_segment_seq) && int4range($3, $4)
            )
            AND NOT EXISTS (
                SELECT 1 FROM seat_lock sl 
                WHERE sl.seat_inventory_id = si.id 
                AND sl.expires_at > CURRENT_TIMESTAMP 
                AND int4range(sl.start_segment_seq, sl.end_segment_seq) && int4range($3, $4)
            )
            LIMIT $5
        `;
        const dbClient = client || pool;
        const result = await dbClient.query(query, [trainRunId, classId, startSegment, endSegment, requiredSeats]);
        return result.rows;
    }

    async createSeatAllocation(client, trainRunId, seatInventoryId, passengerId, pnrNumber, startSegment, endSegment) {
        // Will throw 23P01 (exclusion violation) if double booked concurrently
        const query = `
            INSERT INTO seat_allocation (
                train_run_id, seat_inventory_id, passenger_id, pnr_number, 
                start_segment_seq, end_segment_seq, status
            ) VALUES ($1, $2, $3, $4, $5, $6, 'ALLOCATED')
            RETURNING id
        `;
        const dbClient = client || pool;
        const result = await dbClient.query(query, [
            trainRunId, seatInventoryId, passengerId, pnrNumber, startSegment, endSegment
        ]);
        return result.rows[0];
    }

    async getCoachAndSeatLayout(trainRunId) {
        const query = `
            SELECT 
                c.class_id as class,
                COUNT(s.id)::int as total,
                (COUNT(s.id) - COUNT(sa.id))::int as available,
                1500 as price, 
                0 as waitlist
            FROM coach_inventory c
            JOIN seat_inventory s ON s.coach_inventory_id = c.id
            LEFT JOIN seat_allocation sa ON sa.seat_inventory_id = s.id AND sa.status = 'ALLOCATED'
            WHERE c.train_run_id = $1
            GROUP BY c.class_id
        `;
        const result = await pool.query(query, [trainRunId]);
        
        if (result.rows.length === 0) {
            // Fallback for empty inventory to keep UI from crashing if data isn't fully seeded
            return [
                { class: '1A', available: 12, total: 24, price: 3500 },
                { class: '2A', available: 45, total: 54, price: 2100 },
                { class: '3A', available: 10, total: 72, price: 1500 },
                { class: 'SL', available: 0, total: 144, price: 600, waitlist: 45 }
            ];
        }
        
        return result.rows;
    }
}

export default new SeatRepository();
