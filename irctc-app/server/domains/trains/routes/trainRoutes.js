
import express from 'express';
import { getAllTrains, createTrain, getTrainRoutes, updateTrainRoutes, deleteTrain, getStations } from '../controllers/TrainController.js';
import { protect, isAdmin } from '../../../shared/middleware/authMiddleware.js';

const router = express.Router();

router.get('/stations', getStations);
router.get('/', protect, isAdmin, getAllTrains);
router.post('/', protect, isAdmin, createTrain);
router.delete('/:id', protect, isAdmin, deleteTrain);
router.get('/:id/routes', protect, isAdmin, getTrainRoutes);
router.post('/:id/routes', protect, isAdmin, updateTrainRoutes);

export default router;

