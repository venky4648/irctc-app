import { BaseService } from "../../../shared/utils/BaseService.js";
import PermissionRepository from "../repositories/PermissionRepository.js";

class PermissionService extends BaseService {
    constructor() {
        super(PermissionRepository);
    }
    // Add business logic here
}

export default new PermissionService();
