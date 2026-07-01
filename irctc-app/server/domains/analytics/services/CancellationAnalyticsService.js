import { BaseService } from "../../../shared/utils/BaseService.js";
import CancellationAnalyticsRepository from "../repositories/CancellationAnalyticsRepository.js";

class CancellationAnalyticsService extends BaseService {
    constructor() {
        super(CancellationAnalyticsRepository);
    }
    // Add business logic here
}

export default new CancellationAnalyticsService();
