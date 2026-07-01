import { BaseRepository } from "../../../shared/utils/BaseRepository.js";

class PermissionRepository extends BaseRepository {
    constructor() {
        super('permissions'); // Mock table name
    }
    // Add custom parameterized SQL queries here
}

export default new PermissionRepository();
