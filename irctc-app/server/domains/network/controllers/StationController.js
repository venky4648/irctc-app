import { asyncHandler } from "../../../shared/middleware/errorHandler.js";
import StationService from "../services/StationService.js";

export const createStation = asyncHandler(async (req, res) => {
    const station = await StationService.createStation(req.body);
    res.status(201).json({ success: true, station });
});

export const getStation = asyncHandler(async (req, res) => {
    const station = await StationService.getStationById(req.params.id);
    res.status(200).json({ success: true, station });
});

export const searchStations = asyncHandler(async (req, res) => {
    const result = await StationService.searchStations(req.query);
    res.status(200).json({
        success: true,
        count: result.data.length,
        total: result.total,
        stations: result.data
    });
});

export const updateStation = asyncHandler(async (req, res) => {
    const station = await StationService.updateStation(req.params.id, req.body);
    res.status(200).json({ success: true, station });
});

export const deleteStation = asyncHandler(async (req, res) => {
    await StationService.deleteStation(req.params.id);
    res.status(200).json({ success: true, message: "Station deleted successfully" });
});
