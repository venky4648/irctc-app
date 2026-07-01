import { BaseRepository } from "../../../shared/utils/BaseRepository.js";

class PaymentAnalyticsRepository extends BaseRepository {
    constructor() {
        super('paymentanalyticss'); // Mock table name
    }
    // Add custom parameterized SQL queries here
}

export default new PaymentAnalyticsRepository();
