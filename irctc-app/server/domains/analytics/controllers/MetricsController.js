import { asyncHandler } from "../../../shared/middleware/errorHandler.js";
import MetricsService from "../services/MetricsService.js";

export const getDashboardMetrics = asyncHandler(async (req, res) => {
    const metrics = await MetricsService.getDashboardMetrics();
    res.status(200).json({ success: true, data: metrics });
});

