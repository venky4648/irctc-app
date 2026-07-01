import { BaseService } from "../../../shared/utils/BaseService.js";
import RoleRepository from "../repositories/RoleRepository.js";

class RoleService extends BaseService {
    constructor() {
        super(RoleRepository);
    }
    // Add business logic here
}

export default new RoleService();
