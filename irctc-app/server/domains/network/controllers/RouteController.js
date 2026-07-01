import { asyncHandler } from "../../../shared/middleware/errorHandler.js";
import RouteService from "../services/RouteService.js";

export const createRoute = asyncHandler(async (req, res) => {
    const route = await RouteService.createRoute(req.body);
    res.status(201).json({ success: true, route });
});

export const getRoute = asyncHandler(async (req, res) => {
    const route = await RouteService.getRouteById(req.params.id);
    res.status(200).json({ success: true, route });
});

export const searchRoutes = asyncHandler(async (req, res) => {
    const result = await RouteService.searchRoutes(req.query);
    res.status(200).json({
        success: true,
        count: result.data.length,
        total: result.total,
        routes: result.data
    });
});

export const updateRoute = asyncHandler(async (req, res) => {
    const route = await RouteService.updateRoute(req.params.id, req.body);
    res.status(200).json({ success: true, route });
});

export const deleteRoute = asyncHandler(async (req, res) => {
    await RouteService.deleteRoute(req.params.id);
    res.status(200).json({ success: true, message: "Route deleted successfully" });
});
