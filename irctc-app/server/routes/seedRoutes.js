import express from 'express';
import Train from '../models/train.js';

const router = express.Router();

router.post('/trains', async (req, res) => {
  try {
    await Train.deleteMany({});

    const trains = [
      {
        trainNumber: '12301',
        trainName: 'Rajdhani Express',
        from: 'New Delhi',
        to: 'Howrah',
        departureTime: '16:55',
        arrivalTime: '10:00',
        classes: {
          general: { totalSeats: 200, availableSeats: 150, price: 450 },
          ac3:     { totalSeats: 72,  availableSeats: 40,  price: 1350 },
          ac2:     { totalSeats: 46,  availableSeats: 20,  price: 1950 },
          ac1:     { totalSeats: 24,  availableSeats: 10,  price: 3800 },
        },
      },
      {
        trainNumber: '12951',
        trainName: 'Mumbai Rajdhani',
        from: 'New Delhi',
        to: 'Mumbai Central',
        departureTime: '16:00',
        arrivalTime: '08:35',
        classes: {
          general: { totalSeats: 200, availableSeats: 120, price: 500 },
          ac3:     { totalSeats: 72,  availableSeats: 55,  price: 1500 },
          ac2:     { totalSeats: 46,  availableSeats: 30,  price: 2200 },
          ac1:     { totalSeats: 24,  availableSeats: 12,  price: 4100 },
        },
      },
      {
        trainNumber: '22691',
        trainName: 'Rajdhani Express',
        from: 'New Delhi',
        to: 'Bangalore',
        departureTime: '20:30',
        arrivalTime: '05:45',
        classes: {
          general: { totalSeats: 200, availableSeats: 80,  price: 650 },
          ac3:     { totalSeats: 72,  availableSeats: 30,  price: 1800 },
          ac2:     { totalSeats: 46,  availableSeats: 15,  price: 2600 },
          ac1:     { totalSeats: 24,  availableSeats: 5,   price: 4900 },
        },
      },
      {
        trainNumber: '12002',
        trainName: 'Bhopal Shatabdi',
        from: 'New Delhi',
        to: 'Bhopal',
        departureTime: '06:00',
        arrivalTime: '14:00',
        classes: {
          general: { totalSeats: 150, availableSeats: 100, price: 350 },
          ac3:     { totalSeats: 60,  availableSeats: 45,  price: 950 },
          ac2:     { totalSeats: 40,  availableSeats: 22,  price: 1400 },
          ac1:     { totalSeats: 20,  availableSeats: 8,   price: 2800 },
        },
      },
      {
        trainNumber: '12260',
        trainName: 'Duronto Express',
        from: 'New Delhi',
        to: 'Sealdah',
        departureTime: '20:00',
        arrivalTime: '11:50',
        classes: {
          general: { totalSeats: 180, availableSeats: 60,  price: 420 },
          ac3:     { totalSeats: 66,  availableSeats: 28,  price: 1250 },
          ac2:     { totalSeats: 44,  availableSeats: 10,  price: 1850 },
          ac1:     { totalSeats: 22,  availableSeats: 4,   price: 3500 },
        },
      },
      {
        trainNumber: '12627',
        trainName: 'Karnataka Express',
        from: 'New Delhi',
        to: 'Bangalore City',
        departureTime: '22:30',
        arrivalTime: '06:15',
        classes: {
          general: { totalSeats: 200, availableSeats: 130, price: 380 },
          ac3:     { totalSeats: 72,  availableSeats: 50,  price: 1100 },
          ac2:     { totalSeats: 46,  availableSeats: 28,  price: 1700 },
          ac1:     { totalSeats: 24,  availableSeats: 9,   price: 3200 },
        },
      },
      {
        trainNumber: '12909',
        trainName: 'Garib Rath',
        from: 'Mumbai Central',
        to: 'Howrah',
        departureTime: '17:15',
        arrivalTime: '22:30',
        classes: {
          general: { totalSeats: 220, availableSeats: 170, price: 280 },
          ac3:     { totalSeats: 80,  availableSeats: 65,  price: 750 },
          ac2:     { totalSeats: 0,   availableSeats: 0,   price: 0   },
          ac1:     { totalSeats: 0,   availableSeats: 0,   price: 0   },
        },
      },
      {
        trainNumber: '12589',
        trainName: 'Gorakhpur Express',
        from: 'Gorakhpur',
        to: 'Mumbai CST',
        departureTime: '13:45',
        arrivalTime: '19:20',
        classes: {
          general: { totalSeats: 200, availableSeats: 140, price: 400 },
          ac3:     { totalSeats: 72,  availableSeats: 55,  price: 1200 },
          ac2:     { totalSeats: 46,  availableSeats: 20,  price: 1800 },
          ac1:     { totalSeats: 24,  availableSeats: 7,   price: 3400 },
        },
      },
      {
        trainNumber: '12431',
        trainName: 'Trivandrum Rajdhani',
        from: 'New Delhi',
        to: 'Trivandrum',
        departureTime: '11:00',
        arrivalTime: '17:25',
        classes: {
          general: { totalSeats: 200, availableSeats: 90,  price: 700 },
          ac3:     { totalSeats: 72,  availableSeats: 35,  price: 2000 },
          ac2:     { totalSeats: 46,  availableSeats: 18,  price: 2900 },
          ac1:     { totalSeats: 24,  availableSeats: 6,   price: 5500 },
        },
      },
      {
        trainNumber: '12616',
        trainName: 'Grand Trunk Express',
        from: 'New Delhi',
        to: 'Chennai Central',
        departureTime: '19:05',
        arrivalTime: '05:15',
        classes: {
          general: { totalSeats: 200, availableSeats: 110, price: 560 },
          ac3:     { totalSeats: 72,  availableSeats: 42,  price: 1600 },
          ac2:     { totalSeats: 46,  availableSeats: 24,  price: 2300 },
          ac1:     { totalSeats: 24,  availableSeats: 8,   price: 4300 },
        },
      },
    ];

    await Train.insertMany(trains);
    res.json({ success: true, message: `Seeded ${trains.length} trains successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
