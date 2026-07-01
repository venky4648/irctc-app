import { BaseService } from "../../../shared/utils/BaseService.js";
import ReportRepository from "../repositories/ReportRepository.js";

class ReportService extends BaseService {
    constructor() {
        super(ReportRepository);
    }
    // Add business logic here
}

export default new ReportService();
