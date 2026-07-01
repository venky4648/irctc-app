import { BaseService } from "../../../shared/utils/BaseService.js";
import RevenueRepository from "../repositories/RevenueRepository.js";

class RevenueService extends BaseService {
    constructor() {
        super(RevenueRepository);
    }
    // Add business logic here
}

export default new RevenueService();
