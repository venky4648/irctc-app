import { asyncHandler } from "../../../shared/middleware/errorHandler.js";
import TrainCancellationService from "../services/TrainCancellationService.js";

export const create = asyncHandler(async (req, res) => {
    const item = await TrainCancellationService.create(req.body);
    res.status(201).json({ success: true, data: item });
});

export const getById = asyncHandler(async (req, res) => {
    const item = await TrainCancellationService.getById(req.params.id);
    res.status(200).json({ success: true, data: item });
});

export const getAll = asyncHandler(async (req, res) => {
    const items = await TrainCancellationService.getAll(req.query);
    res.status(200).json({ success: true, count: items.length, data: items });
});

export const update = asyncHandler(async (req, res) => {
    const item = await TrainCancellationService.update(req.params.id, req.body);
    res.status(200).json({ success: true, data: item });
});

export const remove = asyncHandler(async (req, res) => {
    await TrainCancellationService.delete(req.params.id);
    res.status(200).json({ success: true, message: "Deleted successfully" });
});
