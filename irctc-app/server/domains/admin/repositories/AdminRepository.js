import { BaseRepository } from "../../../shared/utils/BaseRepository.js";

class AdminRepository extends BaseRepository {
    constructor() {
        super('admins'); // Mock table name
    }
    // Add custom parameterized SQL queries here
}

export default new AdminRepository();
