
import express from 'express';
import { getAllTrains, createTrain, getTrainRoutes, updateTrainRoutes } from '../controllers/TrainController.js';
import { protect, isAdmin } from '../../../shared/middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, isAdmin, getAllTrains);
router.post('/', protect, isAdmin, createTrain);
router.get('/:id/routes', protect, isAdmin, getTrainRoutes);
router.post('/:id/routes', protect, isAdmin, updateTrainRoutes);

export default router;

