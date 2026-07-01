import { BaseService } from "../../../shared/utils/BaseService.js";
import EmployeeRepository from "../repositories/EmployeeRepository.js";

class EmployeeService extends BaseService {
    constructor() {
        super(EmployeeRepository);
    }
    // Add business logic here
}

export default new EmployeeService();
