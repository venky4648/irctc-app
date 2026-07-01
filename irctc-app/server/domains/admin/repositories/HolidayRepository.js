import { BaseRepository } from "../../../shared/utils/BaseRepository.js";

class HolidayRepository extends BaseRepository {
    constructor() {
        super('holidays'); // Mock table name
    }
    // Add custom parameterized SQL queries here
}

export default new HolidayRepository();
