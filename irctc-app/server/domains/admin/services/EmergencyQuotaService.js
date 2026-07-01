import { BaseService } from "../../../shared/utils/BaseService.js";
import EmergencyQuotaRepository from "../repositories/EmergencyQuotaRepository.js";

class EmergencyQuotaService extends BaseService {
    constructor() {
        super(EmergencyQuotaRepository);
    }
    // Add business logic here
}

export default new EmergencyQuotaService();
