import otpService from '../services/OTPService.js';

class OTPController {
    async sendOTP(req, res, next) {
        try {
            const { email, purpose } = req.body;
            if (!email || !purpose) {
                return res.status(400).json({ success: false, message: 'Email and purpose are required' });
            }
            const result = await otpService.sendOTP(email, purpose);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async verifyOTP(req, res, next) {
        try {
            const { email, otp, purpose } = req.body;
            if (!email || !otp || !purpose) {
                return res.status(400).json({ success: false, message: 'Email, OTP, and purpose are required' });
            }
            const result = await otpService.verifyOTP(email, otp, purpose);
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            next(error);
        }
    }
}

export default new OTPController();
