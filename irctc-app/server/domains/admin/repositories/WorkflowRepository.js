import { BaseRepository } from "../../../shared/utils/BaseRepository.js";

class WorkflowRepository extends BaseRepository {
    constructor() {
        super('workflows'); // Mock table name
    }
    // Add custom parameterized SQL queries here
}

export default new WorkflowRepository();
