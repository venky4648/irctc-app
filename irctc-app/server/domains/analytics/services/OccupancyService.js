import { BaseService } from "../../../shared/utils/BaseService.js";
import OccupancyRepository from "../repositories/OccupancyRepository.js";

class OccupancyService extends BaseService {
    constructor() {
        super(OccupancyRepository);
    }
    // Add business logic here
}

export default new OccupancyService();
