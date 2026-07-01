import { BaseService } from "../../../shared/utils/BaseService.js";
import AdminRepository from "../repositories/AdminRepository.js";

class AdminService extends BaseService {
    constructor() {
        super(AdminRepository);
    }
    // Add business logic here
}

export default new AdminService();
