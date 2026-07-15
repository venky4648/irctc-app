import { pool } from "../../../shared/utils/db.js";

class CouponRepository {
    async findByCode(couponCode) {
        const query = "SELECT * FROM coupons WHERE coupon_code = $1";
        const result = await pool.query(query, [couponCode]);
        return result.rows[0];
    }
    
    async recordUsage(client, couponCode) {
        const query = `
            UPDATE coupons 
            SET current_usage = current_usage + 1 
            WHERE coupon_code = $1 AND current_usage < max_usage 
            RETURNING id
        `;
        const result = await client.query(query, [couponCode]);
        return result.rowCount > 0;
    }
}

export default new CouponRepository();

