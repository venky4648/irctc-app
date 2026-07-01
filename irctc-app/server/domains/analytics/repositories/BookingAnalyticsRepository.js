import { BaseRepository } from "../../../shared/utils/BaseRepository.js";

class BookingAnalyticsRepository extends BaseRepository {
    constructor() {
        super('bookinganalyticss'); // Mock table name
    }
    // Add custom parameterized SQL queries here
}

export default new BookingAnalyticsRepository();
