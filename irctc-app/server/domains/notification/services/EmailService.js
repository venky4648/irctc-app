import nodemailer from 'nodemailer';
import { pool } from '../../../shared/utils/db.js';
import { logger } from '../../../shared/utils/logger.js';

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendEmail(to, subject, html, templateName) {
        try {
            await this.transporter.sendMail({
                from: `"IRCTC clone" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html
            });

            await this.logEmail(to, subject, templateName, 'SENT', null);
            logger.info(`[EmailService] Sent email to ${to} for template ${templateName}`);
            return true;
        } catch (error) {
            await this.logEmail(to, subject, templateName, 'FAILED', error.message);
            logger.error(`[EmailService] Failed to send email to ${to}: ${error.message}`);
            return false;
        }
    }

    async logEmail(recipient, subject, templateName, status, errorMessage) {
        try {
            await pool.query(
                `INSERT INTO email_logs (recipient, subject, template_name, status, error_message)
                 VALUES ($1, $2, $3, $4, $5)`,
                [recipient, subject, templateName, status, errorMessage]
            );
        } catch (error) {
            logger.error(`[EmailService] Failed to log email: ${error.message}`);
        }
    }
}

export default new EmailService();
