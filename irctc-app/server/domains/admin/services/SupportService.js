import { BaseService } from "../../../shared/utils/BaseService.js";
import SupportRepository from "../repositories/SupportRepository.js";

class SupportService extends BaseService {
    constructor() {
        super(SupportRepository);
    }
    // Add business logic here
}

export default new SupportService();
