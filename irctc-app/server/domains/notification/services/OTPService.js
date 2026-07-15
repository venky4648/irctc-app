import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import otpRepository from '../repositories/OTPRepository.js';
import emailService from './EmailService.js';
import templateService from './TemplateService.js';
import { logger } from '../../../shared/utils/logger.js';

class OTPService {
    async sendOTP(email, purpose) {
        try {
            // Generate 6 digit OTP
            const otp = crypto.randomInt(100000, 999999).toString();
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(otp, salt);
            
            // Set expiry to 10 minutes
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            
            await otpRepository.createOTP(email, hash, purpose, expiresAt);
            
            const template = await templateService.getTemplate('otp');
            if (template) {
                const html = templateService.render(template.body_html, { otp, purpose });
                await emailService.sendEmail(email, template.subject, html, 'otp');
            } else {
                // Hardcoded fallback if no template found
                await emailService.sendEmail(email, 'Your Verification OTP', `Your OTP is: ${otp}`, 'otp');
            }
            
            return { success: true, message: 'OTP sent successfully' };
        } catch (error) {
            logger.error(`[OTPService] Error sending OTP: ${error.message}`);
            throw error;
        }
    }

    async verifyOTP(email, otp, purpose) {
        try {
            const latest = await otpRepository.getLatestUnused(email, purpose);
            if (!latest) {
                return { success: false, message: 'Invalid or expired OTP' };
            }
            
            if (new Date() > new Date(latest.expires_at)) {
                return { success: false, message: 'OTP has expired' };
            }
            
            const isMatch = await bcrypt.compare(otp, latest.otp_hash);
            if (!isMatch) {
                return { success: false, message: 'Invalid OTP' };
            }
            
            await otpRepository.markAsUsed(latest.id);
            return { success: true, message: 'OTP verified successfully' };
        } catch (error) {
            logger.error(`[OTPService] Error verifying OTP: ${error.message}`);
            throw error;
        }
    }
}

export default new OTPService();
