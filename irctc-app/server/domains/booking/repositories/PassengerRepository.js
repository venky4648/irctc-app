import { pool } from "../../../shared/utils/db.js";

class PassengerRepository {
    async bulkCreatePassengers(client, pnrId, passengers) {
        // Build a dynamic query for bulk insert
        let query = `
            INSERT INTO passengers (
                pnr_id, passenger_index, name, age, gender, 
                berth_preference_id, food_preference, current_status, 
                current_coach_id, current_seat_number, current_berth_type
            ) VALUES 
        `;
        
        const values = [];
        let index = 1;
        
        const valueStrings = passengers.map((p, i) => {
            values.push(
                pnrId,
                i + 1, // passenger_index
                p.name,
                p.age,
                p.gender,
                p.berth_preference_id || null,
                p.food_preference || null,
                p.current_status,
                p.current_coach_id || null,
                p.current_seat_number || null,
                p.current_berth_type || null
            );
            
            const str = `($${index}, $${index+1}, $${index+2}, $${index+3}, $${index+4}, $${index+5}, $${index+6}, $${index+7}, $${index+8}, $${index+9}, $${index+10})`;
            index += 11;
            return str;
        });

        query += valueStrings.join(", ") + " RETURNING *";

        const dbClient = client || pool;
        const result = await dbClient.query(query, values);
        return result.rows;
    }

    async getPassengersByPnrId(pnrId) {
        const query = "SELECT * FROM passengers WHERE pnr_id = $1 ORDER BY passenger_index ASC";
        const result = await pool.query(query, [pnrId]);
        return result.rows;
    }

    async updatePassengerStatus(client, passengerId, status) {
        const query = "UPDATE passengers SET current_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *";
        const dbClient = client || pool;
        const result = await dbClient.query(query, [status, passengerId]);
        return result.rows[0];
    }
}

export default new PassengerRepository();
