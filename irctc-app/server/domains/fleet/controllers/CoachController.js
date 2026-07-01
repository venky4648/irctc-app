import { asyncHandler } from "../../../shared/middleware/errorHandler.js";
import CoachService from "../services/CoachService.js";

export const createCoach = asyncHandler(async (req, res) => {
    const coach = await CoachService.createCoach(req.body);
    res.status(201).json({ success: true, coach });
});

export const getCoach = asyncHandler(async (req, res) => {
    const coach = await CoachService.getCoachById(req.params.id);
    res.status(200).json({ success: true, coach });
});

export const searchCoaches = asyncHandler(async (req, res) => {
    const result = await CoachService.searchCoaches(req.query);
    res.status(200).json({
        success: true,
        count: result.data.length,
        total: result.total,
        coaches: result.data
    });
});

export const updateCoach = asyncHandler(async (req, res) => {
    const coach = await CoachService.updateCoach(req.params.id, req.body);
    res.status(200).json({ success: true, coach });
});

export const deleteCoach = asyncHandler(async (req, res) => {
    await CoachService.deleteCoach(req.params.id);
    res.status(200).json({ success: true, message: "Coach deleted successfully" });
});
