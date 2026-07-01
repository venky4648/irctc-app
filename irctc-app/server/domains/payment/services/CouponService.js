import CouponRepository from "../repositories/CouponRepository.js";

class CouponService {
    async validateCoupon(couponCode, orderAmount) {
        const coupon = await CouponRepository.findByCode(couponCode);
        
        if (!coupon) {
            const err = new Error("Invalid coupon code");
            err.statusCode = 404;
            throw err;
        }

        if (!coupon.is_active) {
            const err = new Error("Coupon is inactive");
            err.statusCode = 400;
            throw err;
        }

        const now = new Date();
        if (now < new Date(coupon.valid_from) || now > new Date(coupon.valid_until)) {
            const err = new Error("Coupon is expired or not yet valid");
            err.statusCode = 400;
            throw err;
        }

        if (coupon.min_order_value && orderAmount < parseFloat(coupon.min_order_value)) {
            const err = new Error(`Minimum order value of ${coupon.min_order_value} required`);
            err.statusCode = 400;
            throw err;
        }

        let discountAmount = 0;
        if (coupon.discount_type === 'FLAT') {
            discountAmount = parseFloat(coupon.discount_value);
        } else if (coupon.discount_type === 'PERCENTAGE') {
            discountAmount = (orderAmount * parseFloat(coupon.discount_value)) / 100;
            if (coupon.max_discount_amount && discountAmount > parseFloat(coupon.max_discount_amount)) {
                discountAmount = parseFloat(coupon.max_discount_amount);
            }
        }

        return {
            isValid: true,
            discountAmount,
            finalAmount: orderAmount - discountAmount
        };
    }
}

export default new CouponService();
