import { BaseRepository } from "../../../shared/utils/BaseRepository.js";

class MaintenanceRepository extends BaseRepository {
    constructor() {
        super('maintenances'); // Mock table name
    }
    // Add custom parameterized SQL queries here
}

export default new MaintenanceRepository();
