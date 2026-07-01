import { BaseRepository } from "../../../shared/utils/BaseRepository.js";

class OperationalNoticeRepository extends BaseRepository {
    constructor() {
        super('operationalnotices'); // Mock table name
    }
    // Add custom parameterized SQL queries here
}

export default new OperationalNoticeRepository();
