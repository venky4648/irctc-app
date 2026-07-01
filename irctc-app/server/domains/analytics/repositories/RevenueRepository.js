import { BaseRepository } from "../../../shared/utils/BaseRepository.js";

class RevenueRepository extends BaseRepository {
    constructor() {
        super('revenues'); // Mock table name
    }
    // Add custom parameterized SQL queries here
}

export default new RevenueRepository();
