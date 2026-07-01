import { BaseService } from "../../../shared/utils/BaseService.js";
import AnalyticsRepository from "../repositories/AnalyticsRepository.js";

class AnalyticsService extends BaseService {
    constructor() {
        super(AnalyticsRepository);
    }
    // Add business logic here
}

export default new AnalyticsService();
