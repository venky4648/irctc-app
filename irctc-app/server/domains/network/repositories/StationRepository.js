import { pool } from "../../../shared/utils/db.js";
import { buildQueryOptions } from "../../../shared/utils/queryBuilder.js";

class StationRepository {
    async create(stationData) {
        const query = `
            INSERT INTO stations (code, name, city_id, division_id, category_id, latitude, longitude, elevation_meters, number_of_platforms, is_junction, is_terminal, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `;
        const values = [
            stationData.code, stationData.name, stationData.city_id || null, 
            stationData.division_id, stationData.category_id || null, 
            stationData.latitude, stationData.longitude, stationData.elevation_meters || 0,
            stationData.number_of_platforms || 1, stationData.is_junction || false, 
            stationData.is_terminal || false, stationData.status || 'OPERATIONAL'
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async findById(id) {
        const query = "SELECT * FROM stations WHERE id = $1";
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    async findWithFilters(queryOptions) {
        const allowedSorts = ['code', 'name', 'status', 'created_at'];
        const searchableCols = ['code', 'name'];
        const { limitOffsetSql, orderSql, searchSql, params } = buildQueryOptions(queryOptions, allowedSorts, searchableCols);
        
        const query = `SELECT * FROM stations ${searchSql} ${orderSql} ${limitOffsetSql}`;
        const countQuery = `SELECT COUNT(*) FROM stations ${searchSql}`;

        // The count query takes only the search parameter (if exists)
        const countParams = searchSql ? [params[2]] : [];
        
        const [dataResult, countResult] = await Promise.all([
            pool.query(query, params),
            pool.query(countQuery, countParams)
        ]);

        return {
            data: dataResult.rows,
            total: parseInt(countResult.rows[0].count)
        };
    }

    async update(id, stationData) {
        // Simple dynamic update builder
        const fields = [];
        const values = [];
        let index = 1;
        for (const [key, value] of Object.entries(stationData)) {
            if (value !== undefined) {
                fields.push(`${key} = $${index}`);
                values.push(value);
                index++;
            }
        }
        
        if (fields.length === 0) return null;
        
        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        
        const query = `UPDATE stations SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async delete(id) {
        const query = "DELETE FROM stations WHERE id = $1 RETURNING id";
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }
}

export default new StationRepository();
