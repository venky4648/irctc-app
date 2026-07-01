import { asyncHandler } from "../../../shared/middleware/errorHandler.js";
import PermissionService from "../services/PermissionService.js";

export const create = asyncHandler(async (req, res) => {
    const item = await PermissionService.create(req.body);
    res.status(201).json({ success: true, data: item });
});

export const getById = asyncHandler(async (req, res) => {
    const item = await PermissionService.getById(req.params.id);
    res.status(200).json({ success: true, data: item });
});

export const getAll = asyncHandler(async (req, res) => {
    const items = await PermissionService.getAll(req.query);
    res.status(200).json({ success: true, count: items.length, data: items });
});

export const update = asyncHandler(async (req, res) => {
    const item = await PermissionService.update(req.params.id, req.body);
    res.status(200).json({ success: true, data: item });
});

export const remove = asyncHandler(async (req, res) => {
    await PermissionService.delete(req.params.id);
    res.status(200).json({ success: true, message: "Deleted successfully" });
});
