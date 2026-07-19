import { pool } from "../../../shared/utils/db.js";

class JourneySearchService {
    async searchTrains(from, to, date, classId, quota) {
        // Query the trains and train_routes tables to find matching trains
        const query = `
            SELECT 
                t.id AS train_id, 
                t.train_number, 
                t.name AS train_name, 
                r1.station_name AS from_station, 
                r1.departure_time AS from_departure_time, 
                r2.station_name AS to_station, 
                r2.arrival_time AS to_arrival_time,
                r1.halt_order AS from_order,
                r2.halt_order AS to_order,
                t.coaches_json
            FROM trains t
            JOIN train_routes r1 ON t.id = r1.train_id
            JOIN train_routes r2 ON t.id = r2.train_id
            WHERE LOWER(r1.station_name) = LOWER($1)
              AND LOWER(r2.station_name) = LOWER($2)
              AND r1.halt_order < r2.halt_order
        `;
        
        const { rows } = await pool.query(query, [from, to]);
        
        if (rows.length === 0) return [];

        const trainIds = rows.map(r => r.train_id);
        
        // Fetch passenger counts grouped by train, class, and segment
        const bookedQuery = `
            SELECT p.train_id, p.train_class_id, 
                   tr1.halt_order AS booked_from_order,
                   tr2.halt_order AS booked_to_order,
                   COUNT(px.id) as passenger_count
            FROM pnrs p
            JOIN passengers px ON p.id = px.pnr_id
            JOIN train_routes tr1 ON p.train_id = tr1.train_id AND LOWER(p.from_station_name) = LOWER(tr1.station_name)
            JOIN train_routes tr2 ON p.train_id = tr2.train_id AND LOWER(p.to_station_name) = LOWER(tr2.station_name)
            WHERE p.journey_date = $1 AND p.status != 'CANCELLED' AND px.current_status != 'CANCELLED'
              AND p.train_id = ANY($2::uuid[])
            GROUP BY p.train_id, p.train_class_id, tr1.halt_order, tr2.halt_order
        `;
        
        const bookedRes = await pool.query(bookedQuery, [date, trainIds]);
        
        // Build map: searchOrders[train_id] = { searchFromOrder, searchToOrder }
        const searchOrders = {};
        rows.forEach(r => {
            searchOrders[r.train_id] = { fromOrder: r.from_order, toOrder: r.to_order };
        });

        // Calculate peak occupancy for the requested segment
        const bookedMap = {};
        bookedRes.rows.forEach(b => {
            const trainOrders = searchOrders[b.train_id];
            if (!trainOrders) return;

            // Check if this booking overlaps with the searched segment
            // Overlap condition: booking_start < search_end AND booking_end > search_start
            if (b.booked_from_order < trainOrders.toOrder && b.booked_to_order > trainOrders.fromOrder) {
                if (!bookedMap[b.train_id]) bookedMap[b.train_id] = {};
                if (!bookedMap[b.train_id][b.train_class_id]) {
                    // Initialize array to hold occupancy at each station halt in the segment
                    bookedMap[b.train_id][b.train_class_id] = Array(trainOrders.toOrder - trainOrders.fromOrder).fill(0);
                }
                
                // Add the passengers to every overlapping segment
                const arr = bookedMap[b.train_id][b.train_class_id];
                const searchFrom = trainOrders.fromOrder;
                const searchTo = trainOrders.toOrder;
                
                for (let i = searchFrom; i < searchTo; i++) {
                    if (b.booked_from_order <= i && b.booked_to_order > i) {
                        arr[i - searchFrom] += parseInt(b.passenger_count, 10);
                    }
                }
            }
        });

        // Format results
        const results = rows.map(row => {
            const coaches = row.coaches_json || [];
            
            // Build dynamic classes object
            let dynamicClasses = {};
            coaches.forEach(coach => {
                const type = coach.type; // e.g. "Sleeper"
                const totalSeats = parseInt(coach.count, 10) * parseInt(coach.seatsPerCoach, 10);
                const price = parseInt(coach.price, 10) || 500;
                
                // Find peak occupancy across all segments for this request
                let booked = 0;
                if (bookedMap[row.train_id] && bookedMap[row.train_id][type]) {
                    booked = Math.max(...bookedMap[row.train_id][type]);
                }
                
                let available = totalSeats - booked;
                let statusMsg = available > 0 ? 'Available' : 'WL';
                
                dynamicClasses[type] = {
                    availableSeats: Math.max(0, available),
                    totalSeats,
                    price,
                    statusMsg,
                    statusCount: available < 0 ? Math.abs(available) : undefined
                };
            });

            // If empty (no coaches defined in DB), fallback to a mock one so UI doesn't break
            if (Object.keys(dynamicClasses).length === 0) {
                dynamicClasses = {
                    "General": { availableSeats: 100, totalSeats: 100, price: 150, statusMsg: 'Available' }
                };
            }

            // Filter if requested specific class
            if (classId && dynamicClasses[classId]) {
                const temp = dynamicClasses[classId];
                dynamicClasses = { [classId]: temp };
            } else if (classId) {
                // If requested class is not present in this train, return empty classes so UI can filter out this train
                dynamicClasses = {};
            }

            return {
                trainId: row.train_id,
                trainNumber: row.train_number,
                trainName: row.train_name,
                status: "Running",
                fromStation: {
                    name: row.from_station,
                    departureTime: row.from_departure_time
                },
                toStation: {
                    name: row.to_station,
                    arrivalTime: row.to_arrival_time
                },
                classes: dynamicClasses
            };
        });

        // Only return trains that actually have the requested class (if any class was filtered)
        return classId ? results.filter(r => Object.keys(r.classes).length > 0) : results;
    }

    async getTrainRunSeats(trainRunId) {
        return [];
    }

    async getFare(trainRunId, classId, quotaId, passengerCount) {
        return passengerCount * 1000;
    }

    async previewBooking(payload) {
        return payload;
    }
}

export default new JourneySearchService();
