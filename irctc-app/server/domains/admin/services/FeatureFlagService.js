import { BaseService } from "../../../shared/utils/BaseService.js";
import FeatureFlagRepository from "../repositories/FeatureFlagRepository.js";

class FeatureFlagService extends BaseService {
    constructor() {
        super(FeatureFlagRepository);
    }
    // Add business logic here
}

export default new FeatureFlagService();
