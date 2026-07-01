import express from "express";
import { protect, isAdmin } from "../../../shared/middleware/authMiddleware.js";

// Importing all controllers dynamically isn't ideal but we will do it manually for safety
import * as AdminController from "../controllers/AdminController.js";
import * as EmployeeController from "../controllers/EmployeeController.js";
import * as DepartmentController from "../controllers/DepartmentController.js";
import * as RoleController from "../controllers/RoleController.js";
import * as PermissionController from "../controllers/PermissionController.js";
import * as ConfigurationController from "../controllers/ConfigurationController.js";
import * as AuditController from "../controllers/AuditController.js";
import * as SupportController from "../controllers/SupportController.js";
import * as WorkflowController from "../controllers/WorkflowController.js";
import * as FeatureFlagController from "../controllers/FeatureFlagController.js";
import * as HolidayController from "../controllers/HolidayController.js";
import * as OperationalNoticeController from "../controllers/OperationalNoticeController.js";
import * as MaintenanceController from "../controllers/MaintenanceController.js";
import * as PlatformController from "../controllers/PlatformController.js";
import * as EmergencyQuotaController from "../controllers/EmergencyQuotaController.js";
import * as TrainCancellationController from "../controllers/TrainCancellationController.js";

const router = express.Router();

router.use(protect);
router.use(isAdmin);

const controllers = {
    'employees': EmployeeController,
    'departments': DepartmentController,
    'roles': RoleController,
    'permissions': PermissionController,
    'configurations': ConfigurationController,
    'audits': AuditController,
    'supports': SupportController,
    'workflows': WorkflowController,
    'feature-flags': FeatureFlagController,
    'holidays': HolidayController,
    'operational-notices': OperationalNoticeController,
    'maintenances': MaintenanceController,
    'platforms': PlatformController,
    'emergency-quotas': EmergencyQuotaController,
    'train-cancellations': TrainCancellationController
};

for (const [route, controller] of Object.entries(controllers)) {
    router.get(`/${route}`, controller.getAll);
    router.get(`/${route}/:id`, controller.getById);
    router.post(`/${route}`, controller.create);
    router.put(`/${route}/:id`, controller.update);
    router.delete(`/${route}/:id`, controller.remove);
}

export default router;
