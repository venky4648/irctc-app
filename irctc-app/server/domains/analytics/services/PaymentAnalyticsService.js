import { BaseService } from "../../../shared/utils/BaseService.js";
import PaymentAnalyticsRepository from "../repositories/PaymentAnalyticsRepository.js";

class PaymentAnalyticsService extends BaseService {
    constructor() {
        super(PaymentAnalyticsRepository);
    }
    // Add business logic here
}

export default new PaymentAnalyticsService();
