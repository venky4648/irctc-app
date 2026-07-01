import { BaseRepository } from "../../../shared/utils/BaseRepository.js";

class SupportRepository extends BaseRepository {
    constructor() {
        super('supports'); // Mock table name
    }
    // Add custom parameterized SQL queries here
}

export default new SupportRepository();
