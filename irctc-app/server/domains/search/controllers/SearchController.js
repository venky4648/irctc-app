import { asyncHandler } from "../../../shared/middleware/errorHandler.js";
import JourneySearchService from "../services/JourneySearchService.js";

export const searchTrains = asyncHandler(async (req, res) => {
    const { from, to, date, class: classId, quota } = req.query;

    if (!from || !to || !date) {
        const err = new Error("Missing required query parameters: from, to, date");
        err.statusCode = 400;
        throw err;
    }

    try {
        const results = await JourneySearchService.searchTrains(from, to, date, classId, quota);
        res.status(200).json({
            success: true,
            data: results
        });
    } catch (err) {
        if (err.isMissingCapability) {
            res.status(501).json({
                success: false,
                missingCapability: err.missingCapability
            });
        } else {
            throw err;
        }
    }
});

export const getTrainRunSeats = asyncHandler(async (req, res) => {
    const { id: trainRunId } = req.params;

    try {
        const results = await JourneySearchService.getTrainRunSeats(trainRunId);
        res.status(200).json({
            success: true,
            data: results
        });
    } catch (err) {
        if (err.isMissingCapability) {
            res.status(501).json({
                success: false,
                missingCapability: err.missingCapability
            });
        } else {
            throw err;
        }
    }
});

export const getFare = asyncHandler(async (req, res) => {
    const { train_run_id, class_id, quota_id, passenger_count } = req.query;

    try {
        const results = await JourneySearchService.getFare(train_run_id, class_id, quota_id, passenger_count);
        res.status(200).json({
            success: true,
            data: results
        });
    } catch (err) {
        if (err.isMissingCapability) {
            res.status(501).json({
                success: false,
                missingCapability: err.missingCapability
            });
        } else {
            throw err;
        }
    }
});

export const previewBooking = asyncHandler(async (req, res) => {
    try {
        const results = await JourneySearchService.previewBooking(req.body);
        res.status(200).json({
            success: true,
            data: results
        });
    } catch (err) {
        if (err.isMissingCapability) {
            res.status(501).json({
                success: false,
                missingCapability: err.missingCapability
            });
        } else {
            throw err;
        }
    }
});
