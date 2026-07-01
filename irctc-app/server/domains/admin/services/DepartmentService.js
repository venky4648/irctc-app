import { BaseService } from "../../../shared/utils/BaseService.js";
import DepartmentRepository from "../repositories/DepartmentRepository.js";

class DepartmentService extends BaseService {
    constructor() {
        super(DepartmentRepository);
    }
    // Add business logic here
}

export default new DepartmentService();
