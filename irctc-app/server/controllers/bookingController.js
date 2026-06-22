import { Booking } from "../models/bookings.js";
import Train from "../models/train.js";

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

// Check Seat Availability
export const checkAvailabilityAndGetAmount = async (req, res) => {
  try {
    const { trainId, passengers, travelClass } = req.body;

    const train = await Train.findById(trainId).lean();

    if (!train) {
      return res.status(404).json({ message: "Train not found" });
    }

    let classes = train.classes;
    const hasClassData = classes && classes[travelClass] && typeof classes[travelClass].price === 'number';
    if (!hasClassData && train.seatAvailable !== undefined) {
      classes = {
        general: {
          totalSeats: train.seatAvailable,
          availableSeats: train.seatAvailable,
          price: train.price || 0
        }
      };
    }

    const classData = classes ? classes[travelClass] : null;

    if (!classData) {
      return res.status(400).json({
        message: "Invalid travel class",
      });
    }

    if (classData.availableSeats < passengers.length) {
      return res.status(400).json({
        message: "Not enough seats available",
        available: classData.availableSeats,
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
      seatsAvailable: classData.availableSeats,
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
    const { trainId, passengers, travelClass } = req.body;

    const train = await Train.findById(trainId).lean();

    if (!train) {
      return res.status(404).json({ message: "Train not found" });
    }

    let classes = train.classes;
    const hasClassData = classes && classes[travelClass] && typeof classes[travelClass].price === 'number';
    if (!hasClassData && train.seatAvailable !== undefined) {
      classes = {
        general: {
          totalSeats: train.seatAvailable,
          availableSeats: train.seatAvailable,
          price: train.price || 0
        }
      };
    }

    const classData = classes ? classes[travelClass] : null;

    if (!classData) {
      return res.status(400).json({
        message: "Invalid travel class",
      });
    }

    if (classData.availableSeats < passengers.length) {
      return res.status(400).json({
        message: "Not enough seats available",
      });
    }

    const price = typeof classData.price === 'number' ? classData.price : 0;
    const totalAmount = passengers.length * price;

    const payment = await simulatePayment(totalAmount);

    if (payment.status === "failed") {
      return res.status(400).json({
        message: "Payment failed. Please try again.",
      });
    }

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

    const updateQuery = {};
    if (train.classes && train.classes[travelClass] && typeof train.classes[travelClass].availableSeats === 'number') {
      updateQuery[`classes.${travelClass}.availableSeats`] = -passengers.length;
    } else if (train.seatAvailable !== undefined) {
      updateQuery['seatAvailable'] = -passengers.length;
    }

    if (Object.keys(updateQuery).length > 0) {
      await Train.updateOne(
        { _id: trainId },
        { $inc: updateQuery },
        { runValidators: false, strict: false }
      );
    }

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
      return res.status(401).json({
        message: "Not authorized to cancel this booking",
      });
    }

    const train = await Train.findById(booking.train).lean();

    if (!train) {
      return res.status(404).json({ message: "Train not found" });
    }

    const updateQuery = {};
    if (train.classes && train.classes[booking.travelClass] && typeof train.classes[booking.travelClass].availableSeats === 'number') {
      updateQuery[`classes.${booking.travelClass}.availableSeats`] = booking.totalSeats;
    } else if (train.seatAvailable !== undefined) {
      updateQuery['seatAvailable'] = booking.totalSeats;
    }

    if (Object.keys(updateQuery).length > 0) {
      await Train.updateOne(
        { _id: train._id },
        { $inc: updateQuery },
        { runValidators: false, strict: false }
      );
    }

    await booking.deleteOne();

    res.json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Bookings
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate(
        "train",
        "trainName trainNumber from to departureTime arrivalTime"
      );

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
      .populate(
        "train",
        "trainName trainNumber from to departureTime arrivalTime"
      )
      .populate("user", "name email phone");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found with this PNR number",
      });
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
    res.status(500).json({
      message: error.message,
    });
  }
};