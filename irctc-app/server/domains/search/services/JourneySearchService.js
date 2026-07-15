import StationRepository from "../../network/repositories/StationRepository.js";
import TrainRepository from "../../fleet/repositories/TrainRepository.js";
import ScheduleRepository from "../../fleet/repositories/ScheduleRepository.js";
import InventoryRepository from "../../inventory/repositories/InventoryRepository.js";
import SeatRepository from "../../inventory/repositories/SeatRepository.js";
import { SearchResponseDTO } from "../dto/SearchResponseDTO.js";

class JourneySearchService {
    async searchTrains(from, to, date, classId, quota) {
        // 1. Resolve stations
        const fromStations = await StationRepository.findWithFilters({ search: from });
        const toStations = await StationRepository.findWithFilters({ search: to });

        if (fromStations.total === 0 || toStations.total === 0) {
            return [];
        }

        const fromStation = fromStations.data[0];
        const toStation = toStations.data[0];

        // 2. Find candidate trains
        const activeTrains = await TrainRepository.findWithFilters({ status: 'ACTIVE' });
        const results = [];

        // 3. Load schedules & 4. Resolve train run
        for (const train of activeTrains.data) {
            const schedules = await ScheduleRepository.findWithFilters({ train_id: train.id });
            
            const scheduleFrom = schedules.data.find(s => s.station_id === fromStation.id);
            const scheduleTo = schedules.data.find(s => s.station_id === toStation.id);

            if (scheduleFrom && scheduleTo && scheduleFrom.halt_order < scheduleTo.halt_order) {
                // We found a matching train. 
                // Step 4: Resolve train run using InventoryRepository
                // CRITICAL LIMITATION: InventoryRepository.getTrainRun() requires a trainRunId directly.
                // There is NO existing method in InventoryRepository to find a train_run by train_id and date.
                // According to strict rules, we MUST NOT invent data and MUST return HTTP 501.
                throw SearchResponseDTO.formatTrainSearchError("InventoryRepository.findTrainRunByTrainAndDate");
            }
        }

        return results;
    }

    async getTrainRunSeats(trainRunId) {
        // Limitation: SeatRepository only has findAvailableSeats() which requires classId, segments, etc.
        // It does not have a method to return full coach and seat inventory.
        throw SearchResponseDTO.formatTrainSearchError("SeatRepository.getCoachAndSeatInventory");
    }

    async getFare(trainRunId, classId, quotaId, passengerCount) {
        // Limitation: BookingService mocks the fare as passengers * 1000.
        // There is no dedicated pricing or fare repository to resolve base fare, tax, dynamic fare, etc.
        throw SearchResponseDTO.formatTrainSearchError("PaymentRepository.calculateFare");
    }

    async previewBooking(payload) {
        // Limitation: Since train_run_id cannot be resolved, a true preview cannot be generated.
        // The booking payload requires train_run_id which the frontend cannot provide.
        throw SearchResponseDTO.formatTrainSearchError("InventoryRepository.findTrainRunByTrainAndDate");
    }
}

export default new JourneySearchService();
