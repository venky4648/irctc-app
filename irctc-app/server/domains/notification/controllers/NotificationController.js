import notificationService from '../services/NotificationService.js';

class NotificationController {
    async getHistory(req, res, next) {
        try {
            const notifications = await notificationService.getHistory(req.user.id);
            res.status(200).json({ success: true, data: notifications });
        } catch (error) {
            next(error);
        }
    }

    async markAsRead(req, res, next) {
        try {
            const notification = await notificationService.markAsRead(req.params.id, req.user.id);
            res.status(200).json({ success: true, data: notification });
        } catch (error) {
            next(error);
        }
    }

    async markAllAsRead(req, res, next) {
        try {
            await notificationService.markAllAsRead(req.user.id);
            res.status(200).json({ success: true, message: 'All notifications marked as read' });
        } catch (error) {
            next(error);
        }
    }

    async deleteNotification(req, res, next) {
        try {
            await notificationService.deleteNotification(req.params.id);
            res.status(200).json({ success: true, message: 'Notification deleted' });
        } catch (error) {
            next(error);
        }
    }
}

export default new NotificationController();
