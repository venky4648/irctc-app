import mongoose from "mongoose";
import { Booking } from "../models/bookings.js";
import Train from "../models/train.js";
import TrainRoute from "../models/trainRoute.js";
import { SeatOccupancy } from "../models/seatOccupancy.js";

// Generate PNR
const generatePNR = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

// Simulate payment
const simulatePayment = async (amount) => {
  return {
    status: "completed",
    paymentId: "PAY" + Date.now(),
  };
};

const getRequiredSegments = async (trainId, source, destination) => {
  if (!source || !destination) return null;
  const routes = await TrainRoute.find({ train: trainId }).sort({ stationOrder: 1 }).lean();
  
  if (routes.length === 0) {
    return [0];
  }

  const sourceIndex = routes.findIndex(r => r.stationName.toLowerCase().includes(source.toLowerCase()));
  const destIndex = routes.findIndex(r => r.stationName.toLowerCase().includes(destination.toLowerCase()));

  if (sourceIndex === -1 || destIndex === -1 || sourceIndex >= destIndex) {
    const segments = [];
    for (let i = 0; i < routes.length; i++) segments.push(i);
    return segments;
  }

  const segments = [];
  for (let i = sourceIndex; i < destIndex; i++) {
    segments.push(i);
  }
  return segments;
};

const getQueueCounts = async (trainId, journeyDate, travelClass, session = null) => {
  const activeBookings = await Booking.find({
    train: trainId,
    journeyDate,
    travelClass,
    bookingStatus: "confirmed"
  }).session(session).lean();

  let maxWl = 0;
  let currentWl = 0;

  for (const booking of activeBookings) {
    for (const p of booking.passengers) {
      if (p.status === "WL") {
        currentWl++;
        if (p.waitingListNumber > maxWl) maxWl = p.waitingListNumber;
      }
    }
  }

  return { currentWl, maxWl };
};

export const checkAvailabilityAndGetAmount = async (req, res) => {
  try {
    const { trainId, passengers, travelClass, source, destination, journeyDate } = req.body;

    const train = await Train.findById(trainId).lean();
    if (!train) return res.status(404).json({ message: "Train not found" });
    if (!source || !destination || !journeyDate) {
      return res.status(400).json({ message: "Source, destination, and journeyDate are required" });
    }

    const segments = await getRequiredSegments(trainId, source, destination);
    if (!segments) return res.status(400).json({ message: "Invalid source or destination station" });

    let classes = train.classes;
    if (!classes || !classes[travelClass]) return res.status(400).json({ message: "Invalid travel class" });
    
    const classData = classes[travelClass];

    const occupiedRecords = await SeatOccupancy.find({
      trainId,
      journeyDate,
      travelClass,
      segmentIndex: { $in: segments }
    }).lean();

    const occupiedSeats = new Set(occupiedRecords.map(r => r.seatNumber));
    const availableSeatCount = classData.totalSeats - occupiedSeats.size;

    const { currentWl } = await getQueueCounts(trainId, journeyDate, travelClass);

    let statusMsg = "Available";
    let statusCount = availableSeatCount;

    if (availableSeatCount > 0) {
      statusMsg = "Available";
      statusCount = availableSeatCount;
    } else {
      statusMsg = "WL";
      statusCount = currentWl;
    }

    const price = classData.price || 0;
    const totalAmount = passengers.length * price;

    res.status(200).json({
      success: true,
      message: "Availability checked. Proceed to payment.",
      totalAmount,
      travelClass,
      seatsRequested: passengers.length,
      seatsAvailable: availableSeatCount,
      wlCount: currentWl,
      statusMsg,
      statusCount,
      trainDetails: {
        trainId: train._id,
        trainName: train.trainName,
        trainNumber: train.trainNumber,
        pricePerSeat: price,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bookTrain = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let bookingResult;
    // Attempt transaction if replica set is available. Fallback if not.
    try {
      await session.withTransaction(async () => {
        bookingResult = await processBooking(req, session);
      });
    } catch (txError) {
      if (txError.message.includes("Transaction numbers are only allowed")) {
        // Fallback to non-transactional if no replica set
        bookingResult = await processBooking(req, null);
      } else {
        throw txError;
      }
    }
    
    if (req.io) {
      req.io.emit('availabilityChanged', { trainId: req.body.trainId, journeyDate: req.body.journeyDate });
    }

    res.status(201).json({
      success: true,
      message: "Booking confirmed successfully!",
      bookingDetails: bookingResult,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

const processBooking = async (req, session) => {
  const { trainId, passengers, travelClass, source, destination, journeyDate } = req.body;

  const train = await Train.findById(trainId).session(session).lean();
  if (!train) throw new Error("Train not found");

  const segments = await getRequiredSegments(trainId, source, destination);
  const classes = train.classes;
  const classData = classes ? classes[travelClass] : null;

  const occupiedRecords = await SeatOccupancy.find({
    trainId, journeyDate, travelClass, segmentIndex: { $in: segments }
  }).session(session).lean();
  const occupiedSeats = new Set(occupiedRecords.map(r => r.seatNumber));
  const availableSeatCount = classData.totalSeats - occupiedSeats.size;

  const { maxWl } = await getQueueCounts(trainId, journeyDate, travelClass, session);
  
  let nextWlNumber = maxWl + 1;

  const allocatedSeats = [];
  let currentSeatNumber = 1;
  while (allocatedSeats.length < availableSeatCount && currentSeatNumber <= classData.totalSeats) {
    if (!occupiedSeats.has(currentSeatNumber)) {
       allocatedSeats.push(currentSeatNumber);
    }
    currentSeatNumber++;
  }

  const coachSizes = { ac1: 24, ac2: 54, ac3: 72, general: 100 };
  const coachPrefix = { ac1: "H", ac2: "A", ac3: "B", general: "S" };
  const coachSize = coachSizes[travelClass] || 72;
  const prefix = coachPrefix[travelClass] || "C";

  let cnfAllocated = 0;

  passengers.forEach(passenger => {
     if (cnfAllocated < availableSeatCount) {
       passenger.status = "CNF";
       const seatNum = allocatedSeats[cnfAllocated];
       passenger.seatNumber = seatNum;
       passenger.coach = `${prefix}${Math.ceil(seatNum / coachSize) || 1}`;
       cnfAllocated++;
     } else {
       passenger.status = "WL";
       passenger.waitingListNumber = nextWlNumber++;
     }
  });

  const price = classData.price || 0;
  const totalAmount = passengers.length * price;
  const payment = await simulatePayment(totalAmount);

  const pnrNumber = generatePNR();

  const booking = new Booking({
    user: req.user._id,
    train: trainId,
    journeyDate,
    sourceStation: source,
    destinationStation: destination,
    travelClass,
    pnrNumber,
    passengers,
    totalSeats: passengers.length,
    totalAmount,
    bookingStatus: "confirmed",
    paymentStatus: payment.status,
    paymentId: payment.paymentId,
  });

  await booking.save({ session });

  const occupancyDocs = [];
  passengers.forEach(passenger => {
     if (passenger.status === "CNF") {
       segments.forEach(seg => {
         occupancyDocs.push({
           trainId, journeyDate, travelClass,
           seatNumber: passenger.seatNumber,
           coach: passenger.coach,
           segmentIndex: seg,
           bookingId: booking._id
         });
       });
     }
  });
  
  if (occupancyDocs.length > 0) {
    await SeatOccupancy.insertMany(occupancyDocs, { session });
  }

  return booking;
};

export const cancelBooking = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    try {
      await session.withTransaction(async () => {
        await processCancellation(booking, req.io, session);
      });
    } catch (txError) {
      if (txError.message.includes("Transaction numbers are only allowed")) {
        await processCancellation(booking, req.io, null);
      } else {
        throw txError;
      }
    }

    if (req.io) {
      req.io.emit('availabilityChanged', { trainId: booking.train, journeyDate: booking.journeyDate });
    }

    res.json({ success: true, message: "Booking cancelled and queue updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

const processCancellation = async (booking, io, session) => {
  await SeatOccupancy.deleteMany({ bookingId: booking._id }).session(session);
  await Booking.updateOne({ _id: booking._id }, { bookingStatus: "cancelled" }).session(session);

  if (booking.journeyDate) {
    await autoPromote(booking.train, booking.journeyDate, booking.travelClass, io, session);
  }
};

export const cancelPassenger = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { bookingId, passengerId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    try {
      await session.withTransaction(async () => {
        await processPassengerCancellation(booking, passengerId, req.io, session);
      });
    } catch (txError) {
      if (txError.message.includes("Transaction numbers are only allowed")) {
        await processPassengerCancellation(booking, passengerId, req.io, null);
      } else {
        throw txError;
      }
    }

    if (req.io) {
      req.io.emit('availabilityChanged', { trainId: booking.train, journeyDate: booking.journeyDate });
    }

    res.json({ success: true, message: "Passenger cancelled and queue updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

const processPassengerCancellation = async (booking, passengerId, io, session) => {
  const passenger = booking.passengers.id(passengerId);
  if (!passenger) throw new Error("Passenger not found");
  if (passenger.status === "CANCELLED") throw new Error("Passenger already cancelled");

  if (passenger.status === "CNF") {
    await SeatOccupancy.deleteMany({
      bookingId: booking._id,
      seatNumber: passenger.seatNumber,
      coach: passenger.coach
    }).session(session);
  }

  passenger.status = "CANCELLED";
  passenger.seatNumber = undefined;
  passenger.coach = undefined;
  passenger.waitingListNumber = undefined;

  const activePassengers = booking.passengers.filter(p => p.status !== "CANCELLED");
  if (activePassengers.length === 0) {
    booking.bookingStatus = "cancelled";
  }

  await booking.save({ session });

  if (booking.journeyDate) {
    await autoPromote(booking.train, booking.journeyDate, booking.travelClass, io, session);
  }
};

const autoPromote = async (trainId, journeyDate, travelClass, io, session) => {
  if (!journeyDate) return;
  const train = await Train.findById(trainId).session(session).lean();
  const classData = train.classes[travelClass];

  const activeBookings = await Booking.find({
    train: trainId, journeyDate, travelClass, bookingStatus: "confirmed"
  }).sort({ createdAt: 1 }).session(session);

  const coachSizes = { ac1: 24, ac2: 54, ac3: 72, general: 100 };
  const coachPrefix = { ac1: "H", ac2: "A", ac3: "B", general: "S" };
  const coachSize = coachSizes[travelClass] || 72;
  const prefix = coachPrefix[travelClass] || "C";

  let nextWl = 1;

  for (const booking of activeBookings) {
    let bookingUpdated = false;
    const segments = await getRequiredSegments(trainId, booking.sourceStation, booking.destinationStation);
    
    for (const passenger of booking.passengers) {
      if (passenger.status === "CNF") continue;

      if (passenger.status === "WL") {
        const occupiedRecords = await SeatOccupancy.find({
          trainId, journeyDate, travelClass, segmentIndex: { $in: segments }
        }).session(session).lean();
        const occupiedSeats = new Set(occupiedRecords.map(r => r.seatNumber));
        
        let foundSeat = null;
        for (let s = 1; s <= classData.totalSeats; s++) {
          if (!occupiedSeats.has(s)) {
            foundSeat = s;
            break;
          }
        }

        if (foundSeat) {
          // Promote to CNF
          passenger.status = "CNF";
          passenger.seatNumber = foundSeat;
          passenger.coach = `${prefix}${Math.ceil(foundSeat / coachSize) || 1}`;
          passenger.waitingListNumber = undefined;
          bookingUpdated = true;

          const occupancyDocs = segments.map(seg => ({
             trainId, journeyDate, travelClass,
             seatNumber: passenger.seatNumber,
             coach: passenger.coach,
             segmentIndex: seg,
             bookingId: booking._id
          }));
          await SeatOccupancy.insertMany(occupancyDocs, { session });

          // Notify the user via socket
          if (io && booking.user) {
            io.to(booking.user.toString()).emit('ticketConfirmed', {
              bookingId: booking._id,
              passengerName: passenger.name,
              status: "CNF",
              seatNumber: `${passenger.coach}-${passenger.seatNumber}`
            });
          }

        } else {
          // Keep as WL and adjust number
          if (passenger.waitingListNumber !== nextWl) {
             passenger.status = "WL";
             passenger.waitingListNumber = nextWl;
             bookingUpdated = true;
          }
          nextWl++;
        }
      }
    }
    if (bookingUpdated) {
      await booking.save({ session });
    }
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("train", "trainName trainNumber from to departureTime arrivalTime")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookingByPNR = async (req, res) => {
  try {
    const booking = await Booking.findOne({ pnrNumber: req.params.pnr })
      .populate("train", "trainName trainNumber from to departureTime arrivalTime")
      .populate("user", "name email phone");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json({ success: true, bookingDetails: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};