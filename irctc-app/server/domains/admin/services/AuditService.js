import { BaseService } from "../../../shared/utils/BaseService.js";
import AuditRepository from "../repositories/AuditRepository.js";

class AuditService extends BaseService {
    constructor() {
        super(AuditRepository);
    }
    // Add business logic here
}

export default new AuditService();
