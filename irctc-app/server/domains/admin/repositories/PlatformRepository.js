import { BaseRepository } from "../../../shared/utils/BaseRepository.js";

class PlatformRepository extends BaseRepository {
    constructor() {
        super('platforms'); // Mock table name
    }
    // Add custom parameterized SQL queries here
}

export default new PlatformRepository();
