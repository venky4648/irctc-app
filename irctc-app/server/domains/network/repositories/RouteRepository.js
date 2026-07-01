import { pool } from "../../../shared/utils/db.js";
import { buildQueryOptions } from "../../../shared/utils/queryBuilder.js";

class RouteRepository {
    async create(routeData) {
        const query = `
            INSERT INTO routes (code, origin_station_id, destination_station_id, total_distance_km, is_active)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [
            routeData.code, routeData.origin_station_id, routeData.destination_station_id, 
            routeData.total_distance_km, routeData.is_active !== undefined ? routeData.is_active : true
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async findById(id) {
        const query = "SELECT * FROM routes WHERE id = $1";
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    async findWithFilters(queryOptions) {
        const allowedSorts = ['code', 'total_distance_km', 'created_at'];
        const searchableCols = ['code'];
        const { limitOffsetSql, orderSql, searchSql, params } = buildQueryOptions(queryOptions, allowedSorts, searchableCols);
        
        const query = `SELECT * FROM routes ${searchSql} ${orderSql} ${limitOffsetSql}`;
        const countQuery = `SELECT COUNT(*) FROM routes ${searchSql}`;

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

    async update(id, routeData) {
        const fields = [];
        const values = [];
        let index = 1;
        for (const [key, value] of Object.entries(routeData)) {
            if (value !== undefined) {
                fields.push(`${key} = $${index}`);
                values.push(value);
                index++;
            }
        }
        
        if (fields.length === 0) return null;
        
        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        
        const query = `UPDATE routes SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async delete(id) {
        const query = "DELETE FROM routes WHERE id = $1 RETURNING id";
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }
}

export default new RouteRepository();
