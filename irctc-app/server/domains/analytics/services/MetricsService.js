import { BaseService } from "../../../shared/utils/BaseService.js";
import MetricsRepository from "../repositories/MetricsRepository.js";

class MetricsService extends BaseService {
    constructor() {
        super(MetricsRepository);
    }
    // Add business logic here
}

export default new MetricsService();
