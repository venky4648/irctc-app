import { pool } from "../../../shared/utils/db.js";
import { buildQueryOptions } from "../../../shared/utils/queryBuilder.js";

class ScheduleRepository {
    async create(scheduleData) {
        const query = `
            INSERT INTO train_schedules (train_id, station_id, halt_order, arrival_time, departure_time, day_count, distance_from_origin)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [
            scheduleData.train_id, scheduleData.station_id, scheduleData.halt_order, 
            scheduleData.arrival_time, scheduleData.departure_time, scheduleData.day_count, 
            scheduleData.distance_from_origin
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async findById(train_id, station_id) {
        const query = "SELECT * FROM train_schedules WHERE train_id = $1 AND station_id = $2";
        const result = await pool.query(query, [train_id, station_id]);
        return result.rows[0];
    }

    async findWithFilters(queryOptions) {
        // Since schedule search is usually tied to a specific train_id or station_id, we can filter by them
        const allowedSorts = ['halt_order', 'arrival_time', 'distance_from_origin'];
        const searchableCols = []; // Complex to fuzzy search on UUIDs/Times directly, handled via exact match params
        const { limitOffsetSql, orderSql, searchSql, params, paramIndex } = buildQueryOptions(queryOptions, allowedSorts, searchableCols);
        
        let exactFilters = '';
        let nextParamIdx = paramIndex;
        if (queryOptions.train_id) {
            exactFilters += ` WHERE train_id = $${nextParamIdx} `;
            params.push(queryOptions.train_id);
            nextParamIdx++;
        }

        const query = `SELECT * FROM train_schedules ${exactFilters} ${orderSql} ${limitOffsetSql}`;
        const countQuery = `SELECT COUNT(*) FROM train_schedules ${exactFilters}`;

        const countParams = queryOptions.train_id ? [queryOptions.train_id] : [];
        
        const [dataResult, countResult] = await Promise.all([
            pool.query(query, params),
            pool.query(countQuery, countParams)
        ]);

        return {
            data: dataResult.rows,
            total: parseInt(countResult.rows[0].count)
        };
    }

    async update(train_id, station_id, scheduleData) {
        const fields = [];
        const values = [];
        let index = 1;
        for (const [key, value] of Object.entries(scheduleData)) {
            // Cannot update primary keys train_id or station_id easily this way
            if (value !== undefined && key !== 'train_id' && key !== 'station_id') {
                fields.push(`${key} = $${index}`);
                values.push(value);
                index++;
            }
        }
        
        if (fields.length === 0) return null;
        
        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        
        const query = `UPDATE train_schedules SET ${fields.join(', ')} WHERE train_id = $${index} AND station_id = $${index + 1} RETURNING *`;
        values.push(train_id, station_id);
        
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async delete(train_id, station_id) {
        const query = "DELETE FROM train_schedules WHERE train_id = $1 AND station_id = $2 RETURNING train_id, station_id";
        const result = await pool.query(query, [train_id, station_id]);
        return result.rows[0];
    }
}

export default new ScheduleRepository();
