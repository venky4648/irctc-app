import { pool } from "../../../shared/utils/db.js";

class PNRRepository {
    async createPNR(client, pnrData) {
        const query = `
            INSERT INTO pnrs (
                pnr_number, user_id, train_run_id, from_station_id, to_station_id,
                journey_date, train_class_id, quota_id, total_fare, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, pnr_number, status
        `;
        const values = [
            pnrData.pnr_number,
            pnrData.user_id,
            pnrData.train_run_id,
            pnrData.from_station_id,
            pnrData.to_station_id,
            pnrData.journey_date,
            pnrData.train_class_id,
            pnrData.quota_id,
            pnrData.total_fare,
            pnrData.status
        ];
        
        // Use provided transaction client if passed, otherwise use general pool
        const dbClient = client || pool;
        const result = await dbClient.query(query, values);
        return result.rows[0];
    }

    async getPNRByNumber(pnrNumber) {
        const query = "SELECT * FROM pnrs WHERE pnr_number = $1";
        const result = await pool.query(query, [pnrNumber]);
        return result.rows[0];
    }

    async updatePNRStatus(client, pnrId, status) {
        const query = `
            UPDATE pnrs 
            SET status = $1, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2 
            RETURNING id, pnr_number, status
        `;
        const dbClient = client || pool;
        const result = await dbClient.query(query, [status, pnrId]);
        return result.rows[0];
    }
}

export default new PNRRepository();
