import { BaseRepository } from "../../../shared/utils/BaseRepository.js";

class EmployeeRepository extends BaseRepository {
    constructor() {
        super('employees'); // Mock table name
    }
    // Add custom parameterized SQL queries here
}

export default new EmployeeRepository();
