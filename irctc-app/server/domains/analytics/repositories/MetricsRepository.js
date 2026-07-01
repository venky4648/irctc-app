import { BaseRepository } from "../../../shared/utils/BaseRepository.js";

class MetricsRepository extends BaseRepository {
    constructor() {
        super('metricss'); // Mock table name
    }
    // Add custom parameterized SQL queries here
}

export default new MetricsRepository();
