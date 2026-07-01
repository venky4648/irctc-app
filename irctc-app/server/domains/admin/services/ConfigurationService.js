import { BaseService } from "../../../shared/utils/BaseService.js";
import ConfigurationRepository from "../repositories/ConfigurationRepository.js";

class ConfigurationService extends BaseService {
    constructor() {
        super(ConfigurationRepository);
    }
    // Add business logic here
}

export default new ConfigurationService();
