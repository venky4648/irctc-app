import { BaseService } from "../../../shared/utils/BaseService.js";
import DashboardRepository from "../repositories/DashboardRepository.js";

class DashboardService extends BaseService {
    constructor() {
        super(DashboardRepository);
    }
    // Add business logic here
}

export default new DashboardService();
