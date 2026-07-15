import express from 'express';
import { protect } from '../../../shared/middleware/authMiddleware.js';
import notificationController from '../controllers/NotificationController.js';
import otpController from '../controllers/OTPController.js';
import preferenceController from '../controllers/PreferenceController.js';

const router = express.Router();

// OTP Routes (Public usually, but keeping them here)
router.post('/otp/send', otpController.sendOTP);
router.post('/otp/verify', otpController.verifyOTP);

// Protected Routes
router.use(protect);

router.get('/', notificationController.getHistory);
router.put('/read/:id', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

router.get('/preferences', preferenceController.getPreferences);
router.put('/preferences', preferenceController.updatePreferences);

export default router;
