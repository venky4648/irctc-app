import { BaseRepository } from "../../../shared/utils/BaseRepository.js";

class ReportRepository extends BaseRepository {
    constructor() {
        super('reports'); // Mock table name
    }
    // Add custom parameterized SQL queries here
}

export default new ReportRepository();
