import { BaseService } from "../../../shared/utils/BaseService.js";
import HolidayRepository from "../repositories/HolidayRepository.js";

class HolidayService extends BaseService {
    constructor() {
        super(HolidayRepository);
    }
    // Add business logic here
}

export default new HolidayService();
