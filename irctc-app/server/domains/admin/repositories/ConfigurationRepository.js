import { BaseRepository } from "../../../shared/utils/BaseRepository.js";

class ConfigurationRepository extends BaseRepository {
    constructor() {
        super('configurations'); // Mock table name
    }
    // Add custom parameterized SQL queries here
}

export default new ConfigurationRepository();
