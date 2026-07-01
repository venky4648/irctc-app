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
    
    const pnr = await PNRRepository.getPNRByNumber(pnrNumber);
    if (!pnr) {
        const err = new Error("PNR not found");
        err.statusCode = 404;
        throw err;
    }

    // Security check: Only the user who booked it or an admin can view it
    if (pnr.user_id !== req.user.id && req.user.role !== 'admin') {
        const err = new Error("Not authorized to view this PNR");
        err.statusCode = 403;
        throw err;
    }

    const passengers = await PassengerRepository.getPassengersByPnrId(pnr.id);

    res.status(200).json({
        success: true,
        pnr: {
            pnr_number: pnr.pnr_number,
            status: pnr.status,
            journey_date: pnr.journey_date,
            total_fare: pnr.total_fare
        },
        passengers
    });
});
