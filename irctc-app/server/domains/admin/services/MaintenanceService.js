import { BaseService } from "../../../shared/utils/BaseService.js";
import MaintenanceRepository from "../repositories/MaintenanceRepository.js";

class MaintenanceService extends BaseService {
    constructor() {
        super(MaintenanceRepository);
    }
    // Add business logic here
}

export default new MaintenanceService();
