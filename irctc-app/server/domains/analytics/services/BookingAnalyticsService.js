import { BaseService } from "../../../shared/utils/BaseService.js";
import BookingAnalyticsRepository from "../repositories/BookingAnalyticsRepository.js";

class BookingAnalyticsService extends BaseService {
    constructor() {
        super(BookingAnalyticsRepository);
    }
    // Add business logic here
}

export default new BookingAnalyticsService();
