import { pool } from "../../../shared/utils/db.js";
import { buildQueryOptions } from "../../../shared/utils/queryBuilder.js";

class CoachRepository {
    async create(coachData) {
        const query = `
            INSERT INTO coaches (serial_number, coach_type_id, layout_id, manufacturing_date, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [
            coachData.serial_number, coachData.coach_type_id, coachData.layout_id, 
            coachData.manufacturing_date || null, coachData.status || 'IN_SERVICE'
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async findById(id) {
        const query = "SELECT * FROM coaches WHERE id = $1";
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    async findWithFilters(queryOptions) {
        const allowedSorts = ['serial_number', 'status', 'created_at'];
        const searchableCols = ['serial_number', 'status'];
        const { limitOffsetSql, orderSql, searchSql, params } = buildQueryOptions(queryOptions, allowedSorts, searchableCols);
        
        const query = `SELECT * FROM coaches ${searchSql} ${orderSql} ${limitOffsetSql}`;
        const countQuery = `SELECT COUNT(*) FROM coaches ${searchSql}`;

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

    async update(id, coachData) {
        const fields = [];
        const values = [];
        let index = 1;
        for (const [key, value] of Object.entries(coachData)) {
            if (value !== undefined) {
                fields.push(`${key} = $${index}`);
                values.push(value);
                index++;
            }
        }
        
        if (fields.length === 0) return null;
        
        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        
        const query = `UPDATE coaches SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async delete(id) {
        const query = "DELETE FROM coaches WHERE id = $1 RETURNING id";
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }
}

export default new CoachRepository();
