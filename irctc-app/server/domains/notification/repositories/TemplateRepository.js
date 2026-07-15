import { BaseRepository } from '../../../shared/utils/BaseRepository.js';
import { pool } from '../../../shared/utils/db.js';

class TemplateRepository extends BaseRepository {
    constructor() {
        super('notification_templates');
    }

    async getByName(name) {
        const result = await pool.query(
            `SELECT * FROM ${this.tableName} WHERE name = $1 LIMIT 1`,
            [name]
        );
        return result.rows[0];
    }
}

export default new TemplateRepository();
