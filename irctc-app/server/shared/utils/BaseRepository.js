import { pool } from "./db.js";
import { buildQueryOptions } from "./queryBuilder.js";

export class BaseRepository {
    constructor(tableName) {
        this.tableName = tableName;
    }

    async create(data, client = pool) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, i) => '$' + (i + 1)).join(', ');
        const query = 'INSERT INTO ' + this.tableName + ' (' + keys.join(', ') + ') VALUES (' + placeholders + ') RETURNING *';
        const result = await client.query(query, values);
        return result.rows[0];
    }

    async findById(id) {
        const query = 'SELECT * FROM ' + this.tableName + ' WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    async findAll(queryOptions = {}) {
        const { limitOffsetSql, orderSql, searchSql, params } = buildQueryOptions(queryOptions, [], []);
        const query = 'SELECT * FROM ' + this.tableName + ' ' + searchSql + ' ' + orderSql + ' ' + limitOffsetSql;
        const result = await pool.query(query, params);
        return result.rows;
    }

    async update(id, data, client = pool) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setString = keys.map((key, i) => key + ' = $' + (i + 1)).join(', ');
        const query = 'UPDATE ' + this.tableName + ' SET ' + setString + ', updated_at = CURRENT_TIMESTAMP WHERE id = $' + (keys.length + 1) + ' RETURNING *';
        values.push(id);
        const result = await client.query(query, values);
        return result.rows[0];
    }

    async delete(id, client = pool) {
        const query = 'DELETE FROM ' + this.tableName + ' WHERE id = $1 RETURNING id';
        const result = await client.query(query, [id]);
        return result.rows[0];
    }
}
