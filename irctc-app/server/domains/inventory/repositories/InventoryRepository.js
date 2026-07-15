import { pool } from "../../../shared/utils/db.js";

class InventoryRepository {
    async getTrainRun(trainRunId) {
        const query = "SELECT * FROM train_run WHERE id = $1";
        const result = await pool.query(query, [trainRunId]);
        return result.rows[0];
    }

    async getTrainRunForUpdate(client, trainRunId) {
        const query = "SELECT id, status, inventory_version FROM train_run WHERE id = $1";
        const dbClient = client || pool;
        const result = await dbClient.query(query, [trainRunId]);
        return result.rows[0];
    }

    async incrementInventoryVersion(client, trainRunId, currentVersion) {
        // Optimistic Concurrency Control: Only update if the version hasn't changed
        const query = `
            UPDATE train_run 
            SET inventory_version = inventory_version + 1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND inventory_version = $2
            RETURNING inventory_version
        `;
        const dbClient = client || pool;
        const result = await dbClient.query(query, [trainRunId, currentVersion]);
        return result.rowCount > 0;
    }

    async getRunSegments(trainRunId, startStationId, endStationId) {
        // Query the train_id from the train_run
        const runResult = await pool.query("SELECT train_id FROM train_run WHERE id = $1", [trainRunId]);
        if (runResult.rows.length === 0) throw new Error("Train run not found");
        
        const trainId = runResult.rows[0].train_id;
        
        // Find halt_order for start and end stations
        const scheduleQuery = `
            SELECT station_id, halt_order 
            FROM train_schedules 
            WHERE train_id = $1 AND station_id IN ($2, $3)
        `;
        const scheduleResult = await pool.query(scheduleQuery, [trainId, startStationId, endStationId]);
        
        let startSeq = 1;
        let endSeq = 5;
        
        for (const row of scheduleResult.rows) {
            if (row.station_id === startStationId) startSeq = row.halt_order;
            if (row.station_id === endStationId) endSeq = row.halt_order;
        }
        
        return { start_segment_seq: startSeq, end_segment_seq: endSeq };
    }

    async findTrainRunByTrainAndDate(trainId, travelDate) {
        let query = `
            SELECT id, status, inventory_version 
            FROM train_run 
            WHERE train_id = $1 AND travel_date = $2
        `;
        let result = await pool.query(query, [trainId, travelDate]);
        
        if (result.rows.length === 0) {
            // Auto-create for testing environment since we don't have a cron job generating inventory
            const insertQuery = `
                INSERT INTO train_run (train_id, travel_date, status)
                VALUES ($1, $2, 'SCHEDULED')
                RETURNING id, status, inventory_version
            `;
            result = await pool.query(insertQuery, [trainId, travelDate]);
        }
        
        return result.rows[0];
    }
}

export default new InventoryRepository();
