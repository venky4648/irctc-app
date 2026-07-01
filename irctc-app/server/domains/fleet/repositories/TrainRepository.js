import { pool } from "../../../shared/utils/db.js";
import { buildQueryOptions } from "../../../shared/utils/queryBuilder.js";

class TrainRepository {
    async create(trainData) {
        const query = `
            INSERT INTO trains (train_number, name, operator_id, category_id, type_id, return_train_id, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [
            trainData.train_number, trainData.name, trainData.operator_id, 
            trainData.category_id, trainData.type_id, trainData.return_train_id || null, 
            trainData.status || 'ACTIVE'
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async findById(id) {
        const query = "SELECT * FROM trains WHERE id = $1";
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    async findWithFilters(queryOptions) {
        const allowedSorts = ['train_number', 'name', 'status', 'created_at'];
        const searchableCols = ['train_number', 'name'];
        const { limitOffsetSql, orderSql, searchSql, params } = buildQueryOptions(queryOptions, allowedSorts, searchableCols);
        
        const query = `SELECT * FROM trains ${searchSql} ${orderSql} ${limitOffsetSql}`;
        const countQuery = `SELECT COUNT(*) FROM trains ${searchSql}`;

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

    async update(id, trainData) {
        const fields = [];
        const values = [];
        let index = 1;
        for (const [key, value] of Object.entries(trainData)) {
            if (value !== undefined) {
                fields.push(`${key} = $${index}`);
                values.push(value);
                index++;
            }
        }
        
        if (fields.length === 0) return null;
        
        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        
        const query = `UPDATE trains SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async delete(id) {
        const query = "DELETE FROM trains WHERE id = $1 RETURNING id";
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }
}

export default new TrainRepository();
