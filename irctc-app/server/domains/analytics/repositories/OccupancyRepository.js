import { BaseRepository } from "../../../shared/utils/BaseRepository.js";

class OccupancyRepository extends BaseRepository {
    constructor() {
        super('occupancys'); // Mock table name
    }
    // Add custom parameterized SQL queries here
}

export default new OccupancyRepository();
