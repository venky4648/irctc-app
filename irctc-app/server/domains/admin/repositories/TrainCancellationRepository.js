import { BaseRepository } from "../../../shared/utils/BaseRepository.js";

class TrainCancellationRepository extends BaseRepository {
    constructor() {
        super('traincancellations'); // Mock table name
    }
    // Add custom parameterized SQL queries here
}

export default new TrainCancellationRepository();
