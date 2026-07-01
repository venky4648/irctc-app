import { BaseService } from "../../../shared/utils/BaseService.js";
import OperationalNoticeRepository from "../repositories/OperationalNoticeRepository.js";

class OperationalNoticeService extends BaseService {
    constructor() {
        super(OperationalNoticeRepository);
    }
    // Add business logic here
}

export default new OperationalNoticeService();
