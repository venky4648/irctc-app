import { asyncHandler } from "../../../shared/middleware/errorHandler.js";
import ScheduleService from "../services/ScheduleService.js";

export const createSchedule = asyncHandler(async (req, res) => {
    const schedule = await ScheduleService.createSchedule(req.body);
    res.status(201).json({ success: true, schedule });
});

export const getSchedule = asyncHandler(async (req, res) => {
    const { train_id, station_id } = req.params;
    const schedule = await ScheduleService.getScheduleById(train_id, station_id);
    res.status(200).json({ success: true, schedule });
});

export const searchSchedules = asyncHandler(async (req, res) => {
    const result = await ScheduleService.searchSchedules(req.query);
    res.status(200).json({
        success: true,
        count: result.data.length,
        total: result.total,
        schedules: result.data
    });
});

export const updateSchedule = asyncHandler(async (req, res) => {
    const { train_id, station_id } = req.params;
    const schedule = await ScheduleService.updateSchedule(train_id, station_id, req.body);
    res.status(200).json({ success: true, schedule });
});

export const deleteSchedule = asyncHandler(async (req, res) => {
    const { train_id, station_id } = req.params;
    await ScheduleService.deleteSchedule(train_id, station_id);
    res.status(200).json({ success: true, message: "Schedule deleted successfully" });
});
