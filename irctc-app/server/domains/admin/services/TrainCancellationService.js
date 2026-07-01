import { BaseService } from "../../../shared/utils/BaseService.js";
import TrainCancellationRepository from "../repositories/TrainCancellationRepository.js";

class TrainCancellationService extends BaseService {
    constructor() {
        super(TrainCancellationRepository);
    }
    // Add business logic here
}

export default new TrainCancellationService();
