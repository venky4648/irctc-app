import { BaseService } from "../../../shared/utils/BaseService.js";
import PlatformRepository from "../repositories/PlatformRepository.js";

class PlatformService extends BaseService {
    constructor() {
        super(PlatformRepository);
    }
    // Add business logic here
}

export default new PlatformService();
