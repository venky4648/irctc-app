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
        // Mocking the segment logic. In reality, we'd query run_segments and find the overlapping seq numbers.
        // For simulation purposes:
        return { start_segment_seq: 1, end_segment_seq: 5 };
    }
}

export default new InventoryRepository();
