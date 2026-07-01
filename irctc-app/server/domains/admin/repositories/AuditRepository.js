import { BaseRepository } from "../../../shared/utils/BaseRepository.js";

class AuditRepository extends BaseRepository {
    constructor() {
        super('audits'); // Mock table name
    }
    // Add custom parameterized SQL queries here
}

export default new AuditRepository();
