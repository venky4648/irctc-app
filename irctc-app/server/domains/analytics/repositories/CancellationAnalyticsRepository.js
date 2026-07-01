import { BaseRepository } from "../../../shared/utils/BaseRepository.js";

class CancellationAnalyticsRepository extends BaseRepository {
    constructor() {
        super('cancellationanalyticss'); // Mock table name
    }
    // Add custom parameterized SQL queries here
}

export default new CancellationAnalyticsRepository();
