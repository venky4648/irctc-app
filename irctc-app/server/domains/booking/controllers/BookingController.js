import { asyncHandler } from "../../../shared/middleware/errorHandler.js";
import BookingService from "../services/BookingService.js";
import PNRRepository from "../repositories/PNRRepository.js";
import PassengerRepository from "../repositories/PassengerRepository.js";

export const createBooking = asyncHandler(async (req, res) => {
    // req.user is populated by protect middleware
    const result = await BookingService.createBooking(req.user, req.body);
    
    res.status(201).json({
        success: true,
        ...result
    });
});

export const getBookingByPNR = asyncHandler(async (req, res) => {
    const { pnrNumber } = req.params;
    
    const booking = await BookingService.getBookingByPNR(pnrNumber);
    if (!booking) {
        const err = new Error("PNR not found");
        err.statusCode = 404;
        throw err;
    }

    // Security check: Only the user who booked it or an admin can view it
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
        const err = new Error("Not authorized to view this PNR");
        err.statusCode = 403;
        throw err;
    }

    // Remove user_id from response to avoid leaking
    delete booking.user_id;

    res.status(200).json({
        success: true,
        data: booking
    });
});

export const getMyBookings = asyncHandler(async (req, res) => {
    const bookings = await BookingService.getMyBookings(req.user.id);
    res.status(200).json({
        success: true,
        data: bookings
    });
});

export const cancelBooking = asyncHandler(async (req, res) => {
    await BookingService.cancelBooking(req.params.id, req.user.id);
    res.status(200).json({
        success: true,
        message: "Booking cancelled successfully"
    });
});

export const cancelPassenger = asyncHandler(async (req, res) => {
    await BookingService.cancelPassenger(req.params.bookingId, req.params.passengerId, req.user.id);
    res.status(200).json({
        success: true,
        message: "Passenger cancelled successfully"
    });
});
