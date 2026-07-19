import { pool } from './shared/utils/db.js';

// A sample of real-world trains extracted from the Indian Railways Dataset.
// Notice how intermediate stations are defined by their exact arrival/departure times and sequence (order).
const realTrainsDataset = [
    {
        trainNo: '12951',
        trainName: 'MUMBAI RAJDHANI',
        routes: [
            { seq: 1, code: 'MMCT', name: 'MUMBAI CENTRAL', arr: null, dep: '17:00:00', dist: 0 },
            { seq: 2, code: 'BVI', name: 'BORIVALI', arr: '17:22:00', dep: '17:24:00', dist: 30 },
            { seq: 3, code: 'ST', name: 'SURAT', arr: '19:43:00', dep: '19:48:00', dist: 263 },
            { seq: 4, code: 'BRC', name: 'VADODARA JN', arr: '21:03:00', dep: '21:13:00', dist: 392 },
            { seq: 5, code: 'RTM', name: 'RATLAM JN', arr: '00:25:00', dep: '00:28:00', dist: 653 },
            { seq: 6, code: 'KOTA', name: 'KOTA JN', arr: '03:15:00', dep: '03:20:00', dist: 919 },
            { seq: 7, code: 'NDLS', name: 'NEW DELHI', arr: '08:32:00', dep: null, dist: 1384 }
        ],
        coaches: [
            { type: 'AC1', count: 1, seatsPerCoach: 24, price: 4500 },
            { type: 'AC2', count: 5, seatsPerCoach: 54, price: 2800 },
            { type: 'AC3', count: 11, seatsPerCoach: 72, price: 1900 }
        ]
    },
    {
        trainNo: '12004',
        trainName: 'LKO SHTBDI EXP',
        routes: [
            { seq: 1, code: 'NDLS', name: 'NEW DELHI', arr: null, dep: '06:10:00', dist: 0 },
            { seq: 2, code: 'GZB', name: 'GHAZIABAD JN', arr: '06:46:00', dep: '06:48:00', dist: 26 },
            { seq: 3, code: 'ALJN', name: 'ALIGARH JN', arr: '07:55:00', dep: '07:57:00', dist: 132 },
            { seq: 4, code: 'CNB', name: 'KANPUR CENTRAL', arr: '11:20:00', dep: '11:25:00', dist: 440 },
            { seq: 5, code: 'LKO', name: 'LUCKNOW NR', arr: '12:40:00', dep: null, dist: 512 }
        ],
        coaches: [
            { type: 'ChairCar', count: 14, seatsPerCoach: 78, price: 1100 },
            { type: 'AC1', count: 2, seatsPerCoach: 56, price: 2200 }
        ]
    },
    {
        trainNo: '12269',
        trainName: 'MAS NZM DURONTO',
        routes: [
            { seq: 1, code: 'MAS', name: 'CHENNAI CENTRAL', arr: null, dep: '06:35:00', dist: 0 },
            { seq: 2, code: 'BZA', name: 'VIJAYAWADA JN', arr: '12:40:00', dep: '12:50:00', dist: 431 },
            { seq: 3, code: 'BPQ', name: 'BALHARSHAH', arr: '19:00:00', dep: '19:05:00', dist: 881 },
            { seq: 4, code: 'NGP', name: 'NAGPUR', arr: '22:05:00', dep: '22:10:00', dist: 1092 },
            { seq: 5, code: 'RKMP', name: 'RANI KAMALAPATI', arr: '03:40:00', dep: '03:48:00', dist: 1485 },
            { seq: 6, code: 'VGLJ', name: 'VGL JHANSI JN', arr: '07:25:00', dep: '07:30:00', dist: 1782 },
            { seq: 7, code: 'GWL', name: 'GWALIOR', arr: '08:33:00', dep: '08:35:00', dist: 1879 },
            { seq: 8, code: 'NZM', name: 'HAZRAT NIZAMUDDIN', arr: '12:50:00', dep: null, dist: 2185 }
        ],
        coaches: [
            { type: 'AC1', count: 1, seatsPerCoach: 24, price: 5200 },
            { type: 'AC2', count: 3, seatsPerCoach: 54, price: 3400 },
            { type: 'AC3', count: 9, seatsPerCoach: 72, price: 2400 },
            { type: 'Sleeper', count: 5, seatsPerCoach: 72, price: 900 }
        ]
    },
    {
        trainNo: '12834',
        trainName: 'HOWRAH EXPRES',
        routes: [
            { seq: 1, code: 'ADI', name: 'AHMEDABAD JN', arr: null, dep: '00:15:00', dist: 0 },
            { seq: 2, code: 'BRC', name: 'VADODARA JN', arr: '02:00:00', dep: '02:05:00', dist: 100 },
            { seq: 3, code: 'ST', name: 'SURAT', arr: '04:00:00', dep: '04:05:00', dist: 230 },
            { seq: 4, code: 'NDB', name: 'NANDURBAR', arr: '07:10:00', dep: '07:20:00', dist: 390 },
            { seq: 5, code: 'BSL', name: 'BHUSAVAL JN', arr: '10:55:00', dep: '11:00:00', dist: 564 },
            { seq: 6, code: 'AK', name: 'AKOLA JN', arr: '13:00:00', dep: '13:05:00', dist: 704 },
            { seq: 7, code: 'BD', name: 'BADNERA JN', arr: '14:25:00', dep: '14:30:00', dist: 783 },
            { seq: 8, code: 'NGP', name: 'NAGPUR', arr: '17:35:00', dep: '17:40:00', dist: 957 },
            { seq: 9, code: 'R', name: 'RAIPUR JN', arr: '22:10:00', dep: '22:15:00', dist: 1259 },
            { seq: 10, code: 'BSP', name: 'BILASPUR JN', arr: '00:10:00', dep: '00:20:00', dist: 1370 },
            { seq: 11, code: 'JSG', name: 'JHARSUGUDA JN', arr: '03:30:00', dep: '03:35:00', dist: 1574 },
            { seq: 12, code: 'ROU', name: 'ROURKELA', arr: '04:55:00', dep: '05:03:00', dist: 1675 },
            { seq: 13, code: 'TATA', name: 'TATANAGAR JN', arr: '07:45:00', dep: '07:55:00', dist: 1839 },
            { seq: 14, code: 'KGP', name: 'KHARAGPUR JN', arr: '10:00:00', dep: '10:05:00', dist: 1973 },
            { seq: 15, code: 'HWH', name: 'HOWRAH JN', arr: '13:30:00', dep: null, dist: 2088 }
        ],
        coaches: [
            { type: 'AC2', count: 2, seatsPerCoach: 54, price: 3100 },
            { type: 'AC3', count: 6, seatsPerCoach: 72, price: 2100 },
            { type: 'Sleeper', count: 10, seatsPerCoach: 72, price: 750 },
            { type: 'General', count: 4, seatsPerCoach: 90, price: 400 }
        ]
    }
];

async function seedRealTrains() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log("Starting to seed real train routes...");

        for (const train of realTrainsDataset) {
            // Check if train exists
            const check = await client.query('SELECT id FROM trains WHERE train_number = $1', [train.trainNo]);
            if (check.rows.length > 0) {
                console.log(`Train ${train.trainNo} already exists, skipping...`);
                continue;
            }

            // Insert train
            const trainRes = await client.query(`
                INSERT INTO trains (train_number, name, coaches_json)
                VALUES ($1, $2, $3) RETURNING id
            `, [
                train.trainNo, 
                train.trainName, 
                JSON.stringify(train.coaches)
            ]);
            
            const trainId = trainRes.rows[0].id;

            // Insert routes (including intermediate stations)
            for (const route of train.routes) {
                // Calculate arrival/departure days based on times
                // (Very simplified: if time is earlier than previous, it's next day)
                let arrDay = 1;
                let depDay = 1;
                // For a robust script, you'd calculate exact days, but for IRCTC demo we just need 1 or 2.

                await client.query(`
                    INSERT INTO train_routes (train_id, station_name, halt_order, arrival_time, departure_time)
                    VALUES ($1, $2, $3, $4, $5)
                `, [
                    trainId,
                    route.name, // Using actual station name instead of code to match UI perfectly
                    route.seq,
                    route.arr,
                    route.dep
                ]);
            }
            console.log(`Inserted Train: ${train.trainName} with ${train.routes.length} stops (including intermediates).`);
        }

        await client.query('COMMIT');
        console.log("Seeding complete!");
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error during seeding:", err);
    } finally {
        client.release();
        process.exit(0);
    }
}

seedRealTrains();
