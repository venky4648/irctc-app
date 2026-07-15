import { pool } from "../../../shared/utils/db.js";

class UserRepository {
    async findByEmail(email) {
        const query = `
            SELECT u.*, u.phone_number AS mobile_number, 
                   (SELECT r.code FROM auth_roles r 
                    JOIN auth_user_roles ur ON r.id = ur.role_id 
                    WHERE ur.user_id = u.id LIMIT 1) as role
            FROM auth_users u 
            WHERE u.email = $1
        `;
        const result = await pool.query(query, [email]);
        return result.rows[0];
    }

    async findById(id) {
        const query = `
            SELECT u.*, u.phone_number AS mobile_number, 
                   (SELECT r.code FROM auth_roles r 
                    JOIN auth_user_roles ur ON r.id = ur.role_id 
                    WHERE ur.user_id = u.id LIMIT 1) as role
            FROM auth_users u 
            WHERE u.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    async createUser(username, email, mobile_number, password_hash) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const userQuery = `
                INSERT INTO auth_users (username, email, phone_number, password_hash, status)
                VALUES ($1, $2, $3, $4, 'ACTIVE')
                RETURNING id, username, email, phone_number AS mobile_number, status
            `;
            const userResult = await client.query(userQuery, [username, email, mobile_number, password_hash]);
            const user = userResult.rows[0];

            const roleQuery = `
                INSERT INTO auth_user_roles (user_id, role_id)
                SELECT $1, id FROM auth_roles WHERE code = 'PASSENGER'
            `;
            await client.query(roleQuery, [user.id]);

            await client.query('COMMIT');
            return user;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    async updateUser(id, username, email, mobile_number, password_hash, status) {
        const query = `
            UPDATE auth_users 
            SET username = $1, email = $2, phone_number = $3, password_hash = $4, status = $5, updated_at = CURRENT_TIMESTAMP
            WHERE id = $6
            RETURNING id, username, email, phone_number AS mobile_number, status
        `;
        const values = [username, email, mobile_number, password_hash, status, id];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async deleteUser(id) {
        const query = "DELETE FROM auth_users WHERE id = $1 RETURNING id";
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    async findAll() {
        const query = `
            SELECT u.id, u.username as name, u.email, u.phone_number as phone, u.status, u.created_at,
                   (SELECT r.code FROM auth_roles r JOIN auth_user_roles ur ON r.id = ur.role_id WHERE ur.user_id = u.id LIMIT 1) as role
            FROM auth_users u 
            ORDER BY u.created_at DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    async updateUserRole(userId, roleCode) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Delete any existing roles for this user
            await client.query('DELETE FROM auth_user_roles WHERE user_id = $1', [userId]);
            
            // Insert the new role
            const query = `
                INSERT INTO auth_user_roles (user_id, role_id)
                VALUES ($1, (SELECT id FROM auth_roles WHERE code = $2))
                RETURNING *
            `;
            const result = await client.query(query, [userId, roleCode]);
            
            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

export default new UserRepository();
