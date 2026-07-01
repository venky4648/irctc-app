import { BaseRepository } from "../../../shared/utils/BaseRepository.js";

class DashboardRepository extends BaseRepository {
    constructor() {
        super('dashboards'); // Mock table name
    }
    // Add custom parameterized SQL queries here
}

export default new DashboardRepository();
