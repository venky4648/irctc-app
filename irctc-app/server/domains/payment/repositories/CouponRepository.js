import { pool } from "../../../shared/utils/db.js";

class CouponRepository {
    async findByCode(couponCode) {
        const query = "SELECT * FROM coupons WHERE coupon_code = $1";
        const result = await pool.query(query, [couponCode]);
        return result.rows[0];
    }
}

export default new CouponRepository();
