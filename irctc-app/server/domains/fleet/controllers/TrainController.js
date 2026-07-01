import { asyncHandler } from "../../../shared/middleware/errorHandler.js";
import TrainService from "../services/TrainService.js";

export const createTrain = asyncHandler(async (req, res) => {
    const train = await TrainService.createTrain(req.body);
    res.status(201).json({ success: true, train });
});

export const getTrain = asyncHandler(async (req, res) => {
    const train = await TrainService.getTrainById(req.params.id);
    res.status(200).json({ success: true, train });
});

export const searchTrains = asyncHandler(async (req, res) => {
    const result = await TrainService.searchTrains(req.query);
    res.status(200).json({
        success: true,
        count: result.data.length,
        total: result.total,
        trains: result.data
    });
});

export const updateTrain = asyncHandler(async (req, res) => {
    const train = await TrainService.updateTrain(req.params.id, req.body);
    res.status(200).json({ success: true, train });
});

export const deleteTrain = asyncHandler(async (req, res) => {
    await TrainService.deleteTrain(req.params.id);
    res.status(200).json({ success: true, message: "Train deleted successfully" });
});
