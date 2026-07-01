import { BaseRepository } from "../../../shared/utils/BaseRepository.js";

class FeatureFlagRepository extends BaseRepository {
    constructor() {
        super('featureflags'); // Mock table name
    }
    // Add custom parameterized SQL queries here
}

export default new FeatureFlagRepository();
