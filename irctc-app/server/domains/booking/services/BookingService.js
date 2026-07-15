import { pool } from "../../../shared/utils/db.js";
import { logger } from "../../../shared/utils/logger.js";
import PNRService from "./PNRService.js";
import eventBus from "../../../shared/events/EventBus.js";
import PNRRepository from "../repositories/PNRRepository.js";
import PassengerRepository from "../repositories/PassengerRepository.js";
import InventoryRepository from "../../inventory/repositories/InventoryRepository.js";
import SeatRepository from "../../inventory/repositories/SeatRepository.js";
import ScheduleRepository from "../../fleet/repositories/ScheduleRepository.js";

class BookingService {
    async createBooking(user, bookingData) {
        const client = await pool.connect();
        
        try {
            logger.info("Booking Started", { userId: user.id, trainRunId: bookingData.train_run_id });
            await client.query("BEGIN");

            // 1. Validations (simplified for simulation)
            const { train_run_id, from_station_id, to_station_id, journey_date, class_id, quota_id, passengers } = bookingData;
            
            if (!passengers || passengers.length === 0 || passengers.length > 6) {
                throw new Error("Invalid passenger count");
            }

            // 2. OCC Check (Get train run)
            const trainRun = await InventoryRepository.getTrainRunForUpdate(client, train_run_id);
            if (!trainRun) throw new Error("Train run not found");
            
            // 3. Calculate Segments
            const segments = await InventoryRepository.getRunSegments(train_run_id, from_station_id, to_station_id);
            
            // 4. Find Seats
            const availableSeats = await SeatRepository.findAvailableSeats(
                client, train_run_id, class_id, quota_id, 
                segments.start_segment_seq, segments.end_segment_seq, 
                passengers.length
            );

            if (availableSeats.length < passengers.length) {
                // Here we would implement RAC/WL logic. For this simulation, we'll throw Regret.
                throw new Error("Regret - No Availability");
            }

            // 5. Update Inventory Version (OCC)
            const updated = await InventoryRepository.incrementInventoryVersion(client, train_run_id, trainRun.inventory_version);
            if (!updated) {
                throw new Error("Inventory changed. Please try again."); // Optimistic lock failed
            }

            // 6. Generate PNR
            const pnrNumber = PNRService.generatePNR();

            // 7. Calculate Fare dynamically based on distance
            const fromSchedule = await ScheduleRepository.findById(trainRun.train_id, from_station_id);
            const toSchedule = await ScheduleRepository.findById(trainRun.train_id, to_station_id);
            
            let totalFare = passengers.length * 1000; // Fallback
            if (fromSchedule && toSchedule) {
                const distance = Math.abs(toSchedule.distance_from_origin - fromSchedule.distance_from_origin);
                // Base calculation: Distance * 1.5 multiplier + 50 base charge
                const baseFare = Math.max(distance * 1.5, 50);
                // In a real system, we'd apply class multiplier (e.g., 1A=3x, 2A=2x, SL=1x)
                totalFare = passengers.length * baseFare;
            }

            const pnr = await PNRRepository.createPNR(client, {
                pnr_number: pnrNumber,
                user_id: user.id,
                train_run_id,
                from_station_id,
                to_station_id,
                journey_date,
                train_class_id: class_id,
                quota_id,
                total_fare: totalFare,
                status: 'BOOKED'
            });

            // 8. Create Passengers (Optimized mapping for waitlist/RAC/CNF)
            const mappedPassengers = passengers.map(p => ({
                ...p,
                current_status: 'CNF',
            }));

            const createdPassengers = await PassengerRepository.bulkCreatePassengers(client, pnr.id, mappedPassengers);

            // 9. Create Seat Allocations
            for (let i = 0; i < createdPassengers.length; i++) {
                const pax = createdPassengers[i];
                const seat = availableSeats[i];
                await SeatRepository.createSeatAllocation(
                    client,
                    train_run_id,
                    seat.seat_inventory_id,
                    pax.id,
                    pnrNumber,
                    segments.start_segment_seq,
                    segments.end_segment_seq
                );
            }

            await client.query("COMMIT");
            logger.info("Booking Confirmed", { pnrNumber, userId: user.id });

            eventBus.emit('BOOKING_CONFIRMED', {
                userId: user.id,
                email: user.email,
                pnr: pnrNumber,
                trainName: "IRCTC Train",
                trainNumber: train_run_id,
                from: from_station_id,
                to: to_station_id
            });

            return {
                pnr: pnr.pnr_number,
                status: pnr.status,
                passengers: createdPassengers
            };

        } catch (error) {
            await client.query("ROLLBACK");
            logger.error("Booking Failed", { error: error.message, userId: user.id });
            
            // Handle PostgreSQL exclusion violation (GiST)
            if (error.code === '23P01') {
                const err = new Error("Seat already taken due to high concurrency. Please try again.");
                err.statusCode = 409;
                throw err;
            }
            throw error;
        } finally {
            client.release();
        }
    }
}

export default new BookingService();
