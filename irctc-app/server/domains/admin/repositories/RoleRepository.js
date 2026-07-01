import { BaseRepository } from "../../../shared/utils/BaseRepository.js";

class RoleRepository extends BaseRepository {
    constructor() {
        super('roles'); // Mock table name
    }
    // Add custom parameterized SQL queries here
}

export default new RoleRepository();
