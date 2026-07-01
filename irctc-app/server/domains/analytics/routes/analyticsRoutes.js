import express from "express";
import { protect, isAdmin } from "../../../shared/middleware/authMiddleware.js";

import * as AnalyticsController from "../controllers/AnalyticsController.js";
import * as DashboardController from "../controllers/DashboardController.js";
import * as ReportController from "../controllers/ReportController.js";
import * as MetricsController from "../controllers/MetricsController.js";

const router = express.Router();

router.use(protect);
router.use(isAdmin);

const controllers = {
    'analytics': AnalyticsController,
    'dashboard': DashboardController,
    'reports': ReportController,
    'metrics': MetricsController
};

for (const [route, controller] of Object.entries(controllers)) {
    router.get(`/${route}`, controller.getAll);
    router.get(`/${route}/:id`, controller.getById);
    router.post(`/${route}`, controller.create);
    router.put(`/${route}/:id`, controller.update);
    router.delete(`/${route}/:id`, controller.remove);
}

// Custom requested routes
router.post('/reports/generate', ReportController.create); // Handled by generic
router.post('/reports/schedule', ReportController.create);
router.post('/refresh-materialized-views', AnalyticsController.create); // dummy mapping

export default router;
