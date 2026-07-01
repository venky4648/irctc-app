import { pool } from "../../../shared/utils/db.js";

class UserRepository {
    async findByEmail(email) {
        const query = "SELECT * FROM users WHERE email = $1";
        const result = await pool.query(query, [email]);
        return result.rows[0];
    }

    async findById(id) {
        const query = "SELECT * FROM users WHERE id = $1";
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    async createUser(username, email, mobile_number, password_hash) {
        const query = `
            INSERT INTO users (username, email, mobile_number, password_hash, status)
            VALUES ($1, $2, $3, $4, 'ACTIVE')
            RETURNING id, username, email, mobile_number, status
        `;
        const values = [username, email, mobile_number, password_hash];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async updateUser(id, username, email, mobile_number, password_hash, status) {
        const query = `
            UPDATE users 
            SET username = $1, email = $2, mobile_number = $3, password_hash = $4, status = $5, updated_at = CURRENT_TIMESTAMP
            WHERE id = $6
            RETURNING id, username, email, mobile_number, status
        `;
        const values = [username, email, mobile_number, password_hash, status, id];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async deleteUser(id) {
        const query = "DELETE FROM users WHERE id = $1 RETURNING id";
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    async findAll() {
        const query = `
            SELECT id, username as name, email, mobile_number as phone, status, created_at 
            FROM users 
            ORDER BY created_at DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    }
}

export default new UserRepository();
