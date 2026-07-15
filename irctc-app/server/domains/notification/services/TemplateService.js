import templateRepository from '../repositories/TemplateRepository.js';
import { logger } from '../../../shared/utils/logger.js';
import fs from 'fs';
import path from 'path';

class TemplateService {
    async getTemplate(name) {
        // Try getting from DB first
        let template = await templateRepository.getByName(name);
        
        // Fallback to static HTML if DB empty or not found
        if (!template) {
            try {
                // Read from local templates folder as a fallback
                // The filename matches the name + '.html'
                const filePath = path.resolve('domains/notification/templates', `${name}.html`);
                if (fs.existsSync(filePath)) {
                    const html = fs.readFileSync(filePath, 'utf8');
                    template = { name, subject: this.getSubjectFor(name), body_html: html };
                }
            } catch(e) {
                logger.error(`[TemplateService] Fallback template failed for ${name}`);
            }
        }
        
        return template;
    }

    getSubjectFor(name) {
        const subjects = {
            'welcome': 'Welcome to IRCTC Railway Reservation',
            'otp': 'Your Verification OTP',
            'booking_confirmation': 'Booking Confirmed!',
            'booking_cancellation': 'Booking Cancelled',
            'refund_initiated': 'Refund Initiated',
            'password_reset': 'Password Reset Request',
            'admin_notice': 'System Update'
        };
        return subjects[name] || 'Notification from IRCTC';
    }

    render(html, data) {
        if(!html) return '';
        let rendered = html;
        for (const [key, value] of Object.entries(data)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            rendered = rendered.replace(regex, value || '');
        }
        return rendered;
    }
}

export default new TemplateService();
