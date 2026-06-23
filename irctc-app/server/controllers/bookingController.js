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
  const success = true;
  return {
    status: success ? "completed" : "failed",
    paymentId: "PAY" + Date.now(),
  };
};

const getRequiredSegments = async (trainId, source, destination) => {
  if (!source || !destination) return null;
  const routes = await TrainRoute.find({ train: trainId }).sort({ stationOrder: 1 }).lean();
  
  if (routes.length === 0) {
    // Legacy train without route segments defined. Book a single default segment.
    return [0];
  }

  const sourceIndex = routes.findIndex(r => r.stationName.toLowerCase().includes(source.toLowerCase()));
  const destIndex = routes.findIndex(r => r.stationName.toLowerCase().includes(destination.toLowerCase()));

  if (sourceIndex === -1 || destIndex === -1 || sourceIndex >= destIndex) {
    // Fallback if they booked using the global train.from and train.to which might not perfectly match the route names
    const segments = [];
    for (let i = 0; i < routes.length; i++) {
       segments.push(i);
    }
    return segments;
  }

  const segments = [];
  for (let i = sourceIndex; i < destIndex; i++) {
    segments.push(i);
  }
  return segments;
};

// Check Seat Availability
export const checkAvailabilityAndGetAmount = async (req, res) => {
  try {
    const { trainId, passengers, travelClass, source, destination, journeyDate } = req.body;

    const train = await Train.findById(trainId).lean();
    if (!train) return res.status(404).json({ message: "Train not found" });

    if (!source || !destination || !journeyDate) {
      return res.status(400).json({ message: "Source, destination, and journeyDate are required for checking availability" });
    }

    const segments = await getRequiredSegments(trainId, source, destination);
    if (!segments) return res.status(400).json({ message: "Invalid source or destination station for this train" });

    let classes = train.classes;
    const hasClassData = classes && classes[travelClass] && typeof classes[travelClass].price === 'number';
    if (!hasClassData && train.seatAvailable !== undefined) {
      classes = {
        general: { totalSeats: train.seatAvailable, price: train.price || 0 }
      };
    }
    const classData = classes ? classes[travelClass] : null;
    if (!classData) return res.status(400).json({ message: "Invalid travel class" });

    // Find occupied seats for the requested segments
    const occupiedRecords = await SeatOccupancy.find({
      trainId,
      journeyDate,
      travelClass,
      segmentIndex: { $in: segments }
    }).lean();

    const occupiedSeats = new Set(occupiedRecords.map(r => r.seatNumber));
    const availableSeatCount = classData.totalSeats - occupiedSeats.size;

    if (availableSeatCount < passengers.length) {
      return res.status(400).json({
        message: "Not enough seats available for this route segment",
        available: availableSeatCount,
        requested: passengers.length,
      });
    }

    const price = typeof classData.price === 'number' ? classData.price : 0;
    const totalAmount = passengers.length * price;

    res.status(200).json({
      success: true,
      message: "Seats available. Proceed to payment.",
      totalAmount,
      travelClass,
      seatsRequested: passengers.length,
      seatsAvailable: availableSeatCount,
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

// Book Train
export const bookTrain = async (req, res) => {
  try {
    const { trainId, passengers, travelClass, source, destination, journeyDate } = req.body;

    const train = await Train.findById(trainId).lean();
    if (!train) return res.status(404).json({ message: "Train not found" });

    if (!source || !destination || !journeyDate) {
      return res.status(400).json({ message: "Source, destination, and journeyDate are required for booking" });
    }

    const segments = await getRequiredSegments(trainId, source, destination);
    if (!segments) return res.status(400).json({ message: "Invalid source or destination station for this train" });

    let classes = train.classes;
    const hasClassData = classes && classes[travelClass] && typeof classes[travelClass].price === 'number';
    if (!hasClassData && train.seatAvailable !== undefined) {
      classes = {
        general: { totalSeats: train.seatAvailable, price: train.price || 0 }
      };
    }
    const classData = classes ? classes[travelClass] : null;
    if (!classData) return res.status(400).json({ message: "Invalid travel class" });

    // Find occupied seats for the requested segments
    const occupiedRecords = await SeatOccupancy.find({
      trainId,
      journeyDate,
      travelClass,
      segmentIndex: { $in: segments }
    }).lean();

    const occupiedSeats = new Set(occupiedRecords.map(r => r.seatNumber));
    const availableSeatCount = classData.totalSeats - occupiedSeats.size;

    if (availableSeatCount < passengers.length) {
      return res.status(400).json({ message: "Not enough seats available for this route segment. Another user might have just booked." });
    }

    const price = typeof classData.price === 'number' ? classData.price : 0;
    const totalAmount = passengers.length * price;
    const payment = await simulatePayment(totalAmount);

    if (payment.status === "failed") {
      return res.status(400).json({ message: "Payment failed. Please try again." });
    }

    // Allocate seats
    const allocatedSeats = [];
    let currentSeatNumber = 1;
    while (allocatedSeats.length < passengers.length && currentSeatNumber <= classData.totalSeats) {
      if (!occupiedSeats.has(currentSeatNumber)) {
         allocatedSeats.push(currentSeatNumber);
      }
      currentSeatNumber++;
    }

    const coachSizes = { ac1: 24, ac2: 54, ac3: 72, general: 100 };
    const coachPrefix = { ac1: "H", ac2: "A", ac3: "B", general: "S" };
    const coachSize = coachSizes[travelClass] || 72;
    const prefix = coachPrefix[travelClass] || "C";

    passengers.forEach((passenger, i) => {
       const seatNum = allocatedSeats[i];
       const coachIndex = Math.ceil(seatNum / coachSize) || 1;
       const coachName = `${prefix}${coachIndex}`;
       passenger.seatNumber = seatNum;
       passenger.coach = coachName;
    });

    const pnrNumber = generatePNR();

    const booking = await Booking.create({
      user: req.user._id,
      train: trainId,
      travelClass,
      pnrNumber,
      passengers,
      totalSeats: passengers.length,
      totalAmount,
      bookingStatus: "confirmed",
      paymentStatus: payment.status,
      paymentId: payment.paymentId,
    });

    // Insert Segment Occupancy Records
    const occupancyDocs = [];
    passengers.forEach(passenger => {
       segments.forEach(seg => {
         occupancyDocs.push({
           trainId,
           journeyDate,
           travelClass,
           seatNumber: passenger.seatNumber,
           coach: passenger.coach,
           segmentIndex: seg,
           bookingId: booking._id
         });
       });
    });
    
    if (occupancyDocs.length > 0) {
      await SeatOccupancy.insertMany(occupancyDocs);
    }

    // NOTE: We no longer decrement a global `availableSeats` value because availability is computed dynamically.

    res.status(201).json({
      success: true,
      message: "Booking confirmed successfully!",
      bookingDetails: {
        pnrNumber,
        trainName: train.trainName,
        trainNumber: train.trainNumber,
        travelClass,
        passengers,
        totalSeats: passengers.length,
        totalAmount,
        bookingStatus: "confirmed",
      },
      payment: {
        paymentId: payment.paymentId,
        amount: totalAmount,
        status: payment.status,
      },
    });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({
      message: error.message,
      error: error.stack,
      details: error.errors ? Object.keys(error.errors).map(k => error.errors[k].message) : null
    });
  }
};

// Cancel Booking
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to cancel this booking" });
    }

    // Free the seats by deleting SeatOccupancy records
    await SeatOccupancy.deleteMany({ bookingId: booking._id });

    // Update booking status
    booking.bookingStatus = "cancelled";
    await booking.save();

    res.json({
      success: true,
      message: "Booking cancelled successfully and seats have been freed",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Bookings
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("train", "trainName trainNumber from to departureTime arrivalTime")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Booking by PNR
export const getBookingByPNR = async (req, res) => {
  try {
    const { pnr } = req.params;

    const booking = await Booking.findOne({ pnrNumber: pnr })
      .populate("train", "trainName trainNumber from to departureTime arrivalTime")
      .populate("user", "name email phone");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found with this PNR number" });
    }

    res.status(200).json({
      success: true,
      bookingDetails: {
        pnrNumber: booking.pnrNumber,
        travelClass: booking.travelClass,
        passengerDetails: booking.passengers,
        totalSeats: booking.totalSeats,
        totalAmount: booking.totalAmount,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        bookingDate: booking.bookingDate,
        train: booking.train,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};