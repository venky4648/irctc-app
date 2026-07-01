import { asyncHandler } from "../../../shared/middleware/errorHandler.js";
import FeatureFlagService from "../services/FeatureFlagService.js";

export const create = asyncHandler(async (req, res) => {
    const item = await FeatureFlagService.create(req.body);
    res.status(201).json({ success: true, data: item });
});

export const getById = asyncHandler(async (req, res) => {
    const item = await FeatureFlagService.getById(req.params.id);
    res.status(200).json({ success: true, data: item });
});

export const getAll = asyncHandler(async (req, res) => {
    const items = await FeatureFlagService.getAll(req.query);
    res.status(200).json({ success: true, count: items.length, data: items });
});

export const update = asyncHandler(async (req, res) => {
    const item = await FeatureFlagService.update(req.params.id, req.body);
    res.status(200).json({ success: true, data: item });
});

export const remove = asyncHandler(async (req, res) => {
    await FeatureFlagService.delete(req.params.id);
    res.status(200).json({ success: true, message: "Deleted successfully" });
});
