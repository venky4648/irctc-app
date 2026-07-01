import { BaseRepository } from "../../../shared/utils/BaseRepository.js";

class EmergencyQuotaRepository extends BaseRepository {
    constructor() {
        super('emergencyquotas'); // Mock table name
    }
    // Add custom parameterized SQL queries here
}

export default new EmergencyQuotaRepository();
