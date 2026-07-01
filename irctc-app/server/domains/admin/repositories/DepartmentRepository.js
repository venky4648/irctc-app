import { BaseRepository } from "../../../shared/utils/BaseRepository.js";

class DepartmentRepository extends BaseRepository {
    constructor() {
        super('departments'); // Mock table name
    }
    // Add custom parameterized SQL queries here
}

export default new DepartmentRepository();
