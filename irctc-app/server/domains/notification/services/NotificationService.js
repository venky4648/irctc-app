import notificationRepository from '../repositories/NotificationRepository.js';
import preferenceService from './PreferenceService.js';
import emailService from './EmailService.js';
import templateService from './TemplateService.js';
import { logger } from '../../../shared/utils/logger.js';

class NotificationService {
    async dispatchNotification(userId, email, type, data) {
        try {
            const prefs = await preferenceService.getPreferences(userId);
            const template = await templateService.getTemplate(type.toLowerCase());
            
            if (!template) {
                logger.warn(`[NotificationService] No template found for type ${type}.`);
                return;
            }

            const subject = templateService.getSubjectFor(type.toLowerCase());
            const html = templateService.render(template.body_html, data);
            
            // 1. In-App Notification
            if (prefs.in_app_enabled) {
                // Determine a short title from subject, and brief message
                await notificationRepository.create({
                    user_id: userId,
                    type: type,
                    title: subject,
                    message: `You have a new update regarding: ${subject}`
                });
            }

            // 2. Email Notification
            if (prefs.email_enabled && email) {
                await emailService.sendEmail(email, subject, html, type.toLowerCase());
            }

        } catch (error) {
            logger.error(`[NotificationService] Error dispatching ${type}: ${error.message}`);
        }
    }

    async getHistory(userId, limit = 50) {
        return notificationRepository.getByUserId(userId, limit);
    }

    async markAsRead(id, userId) {
        return notificationRepository.markAsRead(id, userId);
    }

    async markAllAsRead(userId) {
        return notificationRepository.markAllAsRead(userId);
    }

    async deleteNotification(id) {
        return notificationRepository.delete(id);
    }
}

export default new NotificationService();
