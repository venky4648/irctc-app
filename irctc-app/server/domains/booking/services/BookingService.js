import { pool } from "../../../shared/utils/db.js";
import { logger } from "../../../shared/utils/logger.js";
import PNRService from "./PNRService.js";
import eventBus from "../../../shared/events/EventBus.js";


function formatCoach(classId) {
    const prefixes = {
        'General': 'GN',
        'Sleeper': 'S',
        'AC3': 'B',
        'AC2': 'A',
        'AC1': 'H',
        'ChairCar': 'C'
    };
    const prefix = prefixes[classId] || 'GN';
    return prefix + (Math.floor(Math.random() * 3) + 1); // e.g. S1, S2, S3
}
class BookingService {
    async createBooking(user, bookingData) {
        const client = await pool.connect();
        
        try {
            logger.info("Booking Started", { userId: user.id });
            await client.query("BEGIN");

            // 1. Validations
            // Note: frontend sends train_run_id which is now actually the train_id
            const { train_run_id: train_id, from_station_id, to_station_id, journey_date, class_id, quota_id, passengers } = bookingData;
            
            if (!passengers || passengers.length === 0 || passengers.length > 6) {
                throw new Error("Invalid passenger count");
            }

            // 2. Generate PNR
            const pnrNumber = PNRService.generatePNR();

            // 3. Fetch Train Details and Calculate Fare/Availability
            const trainRes = await client.query("SELECT name, train_number, coaches_json FROM trains WHERE id = $1", [train_id]);
            if (trainRes.rows.length === 0) throw new Error("Train not found");
            const trainInfo = trainRes.rows[0];

            const coaches = trainInfo.coaches_json || [];
            const targetCoach = coaches.find(c => c.type === class_id) || { count: 2, seatsPerCoach: 72, price: 500 };
            
            const totalSeats = parseInt(targetCoach.count, 10) * parseInt(targetCoach.seatsPerCoach, 10);
            const baseFare = parseInt(targetCoach.price, 10) || 500;
            let totalFare = passengers.length * baseFare;

            // We also need the halt_order of the newly requested from_station and to_station
            const requestedRouteRes = await client.query(`
                SELECT station_name, halt_order FROM train_routes
                WHERE train_id = $1 AND LOWER(station_name) IN (LOWER($2), LOWER($3))
            `, [train_id, from_station_id, to_station_id]);
            
            let searchFromOrder = 0;
            let searchToOrder = 0;
            for (const r of requestedRouteRes.rows) {
                if (r.station_name.toLowerCase() === from_station_id.toLowerCase()) searchFromOrder = r.halt_order;
                if (r.station_name.toLowerCase() === to_station_id.toLowerCase()) searchToOrder = r.halt_order;
            }

            // Check how many seats are already booked on overlapping segments
            const bookedRes = await client.query(`
                SELECT tr1.halt_order AS booked_from_order, 
                       tr2.halt_order AS booked_to_order,
                       COUNT(px.id) as passenger_count
                FROM pnrs p
                JOIN passengers px ON p.id = px.pnr_id
                JOIN train_routes tr1 ON p.train_id = tr1.train_id AND LOWER(p.from_station_name) = LOWER(tr1.station_name)
                JOIN train_routes tr2 ON p.train_id = tr2.train_id AND LOWER(p.to_station_name) = LOWER(tr2.station_name)
                WHERE p.journey_date = $1 AND p.train_id = $2 AND p.train_class_id = $3
                  AND p.status != 'CANCELLED' AND px.current_status != 'CANCELLED'
                GROUP BY tr1.halt_order, tr2.halt_order
            `, [journey_date, train_id, class_id]);
            
            let peakBooked = 0;
            for (let i = searchFromOrder; i < searchToOrder; i++) {
                let currentSegmentBooked = 0;
                for (const b of bookedRes.rows) {
                    if (b.booked_from_order <= i && b.booked_to_order > i) {
                        currentSegmentBooked += parseInt(b.passenger_count, 10);
                    }
                }
                if (currentSegmentBooked > peakBooked) {
                    peakBooked = currentSegmentBooked;
                }
            }
            
            let currentBooked = peakBooked;

            // 4. Create PNR Record
            const pnrRes = await client.query(
                `INSERT INTO pnrs (pnr_number, user_id, train_id, from_station_name, to_station_name, journey_date, train_class_id, quota_id, total_fare, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
                [pnrNumber, user.id, train_id, from_station_id, to_station_id, journey_date, class_id, quota_id, totalFare, 'BOOKED']
            );
            const pnr = pnrRes.rows[0];

            // 5. Create Passengers and Assign Status
            const createdPassengers = [];
            for (let i = 0; i < passengers.length; i++) {
                const pax = passengers[i];
                currentBooked++;
                
                // If currentBooked exceeds totalSeats, it's WL
                const paxStatus = currentBooked > totalSeats ? 'WL' : 'CNF';
                
                const paxRes = await client.query(
                    `INSERT INTO passengers (pnr_id, passenger_index, name, age, gender, berth_preference_id, current_status)
                     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                    [pnr.id, i + 1, pax.name, pax.age, pax.gender, pax.berthPreference || 'Lower', paxStatus]
                );
                createdPassengers.push(paxRes.rows[0]);
            }

            await client.query("COMMIT");
            logger.info("Booking Confirmed", { pnrNumber, userId: user.id });

            eventBus.emit('BOOKING_CONFIRMED', {
                userId: user.id,
                email: user.email,
                pnr: pnrNumber,
                trainName: trainInfo.name,
                trainNumber: trainInfo.train_number,
                from: from_station_id,
                to: to_station_id
            });

            return {
                bookingDetails: {
                    pnrNumber: pnr.pnr_number,
                    bookingStatus: pnr.status,
                    trainName: trainInfo.name,
                    trainNumber: trainInfo.train_number,
                    travelClass: pnr.train_class_id,
                    totalSeats: createdPassengers.length,
                    totalAmount: pnr.total_fare,
                    passengers: createdPassengers.map(p => ({
                        name: p.name,
                        age: p.age,
                        gender: p.gender,
                        berthPreference: p.berth_preference_id || 'Lower',
                        status: p.current_status,
                        coach: formatCoach(pnr.train_class_id),
                        seatNumber: Math.floor(Math.random() * 70) + 1
                    }))
                }
            };

        } catch (error) {
            await client.query("ROLLBACK");
            logger.error("Booking Failed", { error: error.message, userId: user.id });
            throw error;
        } finally {
            client.release();
        }
    }

    async getBookingByPNR(pnrNumber) {
        const query = `
            SELECT 
                p.id as pnr_id, p.pnr_number, p.journey_date, p.train_class_id, p.total_fare, p.status as pnr_status, p.created_at, p.user_id,
                t.name as train_name, t.train_number,
                p.from_station_name as from_station,
                p.to_station_name as to_station,
                (SELECT arrival_time FROM train_routes WHERE train_id = t.id AND station_name = p.to_station_name LIMIT 1) as to_arrival_time,
                (SELECT departure_time FROM train_routes WHERE train_id = t.id AND station_name = p.from_station_name LIMIT 1) as from_departure_time,
                px.id as pax_id, px.name as pax_name, px.age as pax_age, px.gender as pax_gender, px.berth_preference_id as pax_berth_preference, px.current_status as pax_status
            FROM pnrs p
            JOIN trains t ON p.train_id = t.id
            LEFT JOIN passengers px ON px.pnr_id = p.id
            WHERE p.pnr_number = $1
        `;
        const { rows } = await pool.query(query, [pnrNumber]);
        
        if (rows.length === 0) return null;

        const booking = {
            id: rows[0].pnr_id,
            user_id: rows[0].user_id,
            bookingStatus: rows[0].pnr_status === 'BOOKED' ? 'confirmed' : 'cancelled',
            pnrNumber: rows[0].pnr_number,
            bookingDate: rows[0].created_at,
            travelClass: rows[0].train_class_id,
            totalAmount: rows[0].total_fare,
            paymentStatus: 'completed',
            train: {
                trainName: rows[0].train_name,
                trainNumber: rows[0].train_number,
                from: rows[0].from_station,
                to: rows[0].to_station,
                departureTime: rows[0].from_departure_time || '00:00',
                arrivalTime: rows[0].to_arrival_time || '00:00'
            },
            passengers: [],
            passengerDetails: [],
            totalSeats: 0
        };

        for (const row of rows) {
            if (row.pax_id) {
                const pax = {
                    name: row.pax_name,
                    age: row.pax_age,
                    gender: row.pax_gender,
                    berthPreference: row.pax_berth_preference || 'Lower',
                    status: row.pax_status,
                    coach: formatCoach(rows[0].train_class_id), 
                    seatNumber: Math.floor(Math.random() * 70) + 1 
                };
                booking.passengers.push(pax);
                booking.passengerDetails.push(pax);
                booking.totalSeats++;
            }
        }
        
        return booking;
    }

    async getMyBookings(userId) {
        // Fetch all PNRs and their associated passengers and train info
        const query = `
            SELECT 
                p.id as pnr_id, p.pnr_number, p.journey_date, p.train_class_id, p.total_fare, p.status as pnr_status, p.created_at,
                t.name as train_name, t.train_number,
                p.from_station_name as from_station,
                p.to_station_name as to_station,
                (SELECT arrival_time FROM train_routes WHERE train_id = t.id AND station_name = p.to_station_name LIMIT 1) as to_arrival_time,
                (SELECT departure_time FROM train_routes WHERE train_id = t.id AND station_name = p.from_station_name LIMIT 1) as from_departure_time,
                px.id as pax_id, px.name as pax_name, px.age as pax_age, px.gender as pax_gender, px.berth_preference_id as pax_berth_preference, px.current_status as pax_status
            FROM pnrs p
            JOIN trains t ON p.train_id = t.id
            LEFT JOIN passengers px ON px.pnr_id = p.id
            WHERE p.user_id = $1
            ORDER BY p.created_at DESC
        `;
        const { rows } = await pool.query(query, [userId]);

        // Group by PNR
        const bookingsMap = {};
        for (const row of rows) {
            if (!bookingsMap[row.pnr_id]) {
                bookingsMap[row.pnr_id] = {
                    id: row.pnr_id,
                    bookingStatus: row.pnr_status === 'BOOKED' ? 'confirmed' : 'cancelled',
                    pnrNumber: row.pnr_number,
                    bookingDate: row.created_at,
                    travelClass: row.train_class_id,
                    totalAmount: row.total_fare,
                    paymentStatus: 'completed',
                    train: {
                        trainName: row.train_name,
                        trainNumber: row.train_number,
                        from: row.from_station,
                        to: row.to_station,
                        departureTime: row.from_departure_time || '00:00',
                        arrivalTime: row.to_arrival_time || '00:00'
                    },
                    passengers: [],
                    totalSeats: 0
                };
            }
            if (row.pax_id) {
                bookingsMap[row.pnr_id].passengers.push({
                    id: row.pax_id,
                    name: row.pax_name,
                    age: row.pax_age,
                    gender: row.pax_gender,
                    berthPreference: row.pax_berth_preference || 'Lower',
                    status: row.pax_status,
                    coach: formatCoach(row.train_class_id), 
                    seatNumber: Math.floor(Math.random() * 70) + 1
                });
                bookingsMap[row.pnr_id].totalSeats++;
            }
        }

        return Object.values(bookingsMap);
    }

    async _processWaitlist(client, train_id, journey_date, class_id, countToConfirm) {
        if (countToConfirm <= 0) return;
        
        const wlRes = await client.query(`
            SELECT px.id, p.user_id, p.pnr_number, px.name
            FROM passengers px
            JOIN pnrs p ON p.id = px.pnr_id
            WHERE p.train_id = $1 AND p.journey_date = $2 AND p.train_class_id = $3
              AND px.current_status = 'WL' AND p.status != 'CANCELLED'
            ORDER BY px.created_at ASC
            LIMIT $4
        `, [train_id, journey_date, class_id, countToConfirm]);

        for (const pax of wlRes.rows) {
            await client.query("UPDATE passengers SET current_status = 'CNF' WHERE id = $1", [pax.id]);
            eventBus.emit('WL_CONFIRMED', {
                userId: pax.user_id,
                pnr: pax.pnr_number,
                passengerName: pax.name
            });
            logger.info("Waitlist passenger upgraded", { pnr: pax.pnr_number, passengerId: pax.id });
        }
    }

    async cancelBooking(bookingId, userId) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            
            // Verify ownership and get details
            const check = await client.query("SELECT train_id, journey_date, train_class_id FROM pnrs WHERE id = $1 AND user_id = $2 AND status != 'CANCELLED'", [bookingId, userId]);
            if (check.rows.length === 0) throw new Error("Booking not found, already cancelled, or not authorized");
            const { train_id, journey_date, train_class_id } = check.rows[0];

            // Count how many CNF passengers are being cancelled
            const cnfCountRes = await client.query("SELECT COUNT(*) as cnt FROM passengers WHERE pnr_id = $1 AND current_status = 'CNF'", [bookingId]);
            const freedSeatsCount = parseInt(cnfCountRes.rows[0].cnt, 10);

            await client.query("UPDATE pnrs SET status = 'CANCELLED' WHERE id = $1", [bookingId]);
            await client.query("UPDATE passengers SET current_status = 'CANCELLED' WHERE pnr_id = $1", [bookingId]);

            // Process waitlist if seats were freed
            if (freedSeatsCount > 0) {
                await this._processWaitlist(client, train_id, journey_date, train_class_id, freedSeatsCount);
            }

            await client.query("COMMIT");
            return true;
        } catch (e) {
            await client.query("ROLLBACK");
            throw e;
        } finally {
            client.release();
        }
    }

    async cancelPassenger(bookingId, passengerId, userId) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            
            // Verify ownership and get details
            const check = await client.query("SELECT train_id, journey_date, train_class_id FROM pnrs WHERE id = $1 AND user_id = $2 AND status != 'CANCELLED'", [bookingId, userId]);
            if (check.rows.length === 0) throw new Error("Booking not found, already cancelled, or not authorized");
            const { train_id, journey_date, train_class_id } = check.rows[0];

            // Check if this specific passenger is CNF
            const paxCheck = await client.query("SELECT current_status FROM passengers WHERE id = $1 AND pnr_id = $2 AND current_status != 'CANCELLED'", [passengerId, bookingId]);
            if (paxCheck.rows.length === 0) throw new Error("Passenger not found or already cancelled");
            const freedSeatsCount = paxCheck.rows[0].current_status === 'CNF' ? 1 : 0;

            await client.query("UPDATE passengers SET current_status = 'CANCELLED' WHERE id = $1 AND pnr_id = $2", [passengerId, bookingId]);

            // Check if all passengers are cancelled
            const pax = await client.query("SELECT current_status FROM passengers WHERE pnr_id = $1", [bookingId]);
            const allCancelled = pax.rows.every(p => p.current_status === 'CANCELLED');
            if (allCancelled) {
                await client.query("UPDATE pnrs SET status = 'CANCELLED' WHERE id = $1", [bookingId]);
            }

            // Process waitlist if seats were freed
            if (freedSeatsCount > 0) {
                await this._processWaitlist(client, train_id, journey_date, train_class_id, freedSeatsCount);
            }

            await client.query("COMMIT");
            return true;
        } catch (e) {
            await client.query("ROLLBACK");
            throw e;
        } finally {
            client.release();
        }
    }
}

export default new BookingService();
