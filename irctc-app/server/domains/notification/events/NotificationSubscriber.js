import eventBus from '../../../shared/events/EventBus.js';
import notificationService from '../services/NotificationService.js';
import { logger } from '../../../shared/utils/logger.js';

class NotificationSubscriber {
    init() {
        logger.info('[NotificationSubscriber] Initializing event listeners...');

        eventBus.on('USER_REGISTERED', async (payload) => {
            const { user } = payload;
            await notificationService.dispatchNotification(user.id, user.email, 'welcome', {
                userName: user.name
            });
        });

        eventBus.on('BOOKING_CONFIRMED', async (payload) => {
            const { userId, email, pnr, trainName, trainNumber, from, to } = payload;
            await notificationService.dispatchNotification(userId, email, 'booking_confirmation', {
                pnr, trainName, trainNumber, from, to
            });
        });

        eventBus.on('BOOKING_CANCELLED', async (payload) => {
            const { userId, email, pnr } = payload;
            await notificationService.dispatchNotification(userId, email, 'booking_cancellation', {
                pnr
            });
        });

        eventBus.on('PAYMENT_SUCCESS', async (payload) => {
            const { userId, email, amount, transactionId } = payload;
            await notificationService.dispatchNotification(userId, email, 'payment_success', {
                amount, transactionId
            });
        });

        eventBus.on('REFUND_INITIATED', async (payload) => {
            const { userId, email, amount, refundId } = payload;
            await notificationService.dispatchNotification(userId, email, 'refund_initiated', {
                amount, refundId
            });
        });

        eventBus.on('PASSWORD_RESET', async (payload) => {
            const { userId, email } = payload;
            await notificationService.dispatchNotification(userId, email, 'password_reset', {});
        });

        eventBus.on('ADMIN_NOTICE', async (payload) => {
            const { userId, email, message } = payload;
            await notificationService.dispatchNotification(userId, email, 'admin_notice', {
                message
            });
        });
    }
}

export default new NotificationSubscriber();
