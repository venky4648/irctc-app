import { BaseRepository } from "../../../shared/utils/BaseRepository.js";

class AnalyticsRepository extends BaseRepository {
    constructor() {
        super('analyticss'); // Mock table name
    }
    // Add custom parameterized SQL queries here
}

export default new AnalyticsRepository();
