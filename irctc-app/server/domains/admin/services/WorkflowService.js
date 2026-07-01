import { BaseService } from "../../../shared/utils/BaseService.js";
import WorkflowRepository from "../repositories/WorkflowRepository.js";

class WorkflowService extends BaseService {
    constructor() {
        super(WorkflowRepository);
    }
    // Add business logic here
}

export default new WorkflowService();
