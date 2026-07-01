import dotenv from "dotenv";
import pg from "pg";
import { logger, dbLogger } from "./logger.js";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
});

// Intercept queries for logging (development only for performance reasons)
const originalQuery = pool.query;
pool.query = function (text, params, callback) {
    const start = Date.now();
    
    // If it's a promise based query
    if (typeof callback !== 'function') {
        return originalQuery.apply(this, arguments).then((res) => {
            const duration = Date.now() - start;
            if (process.env.NODE_ENV !== 'production') {
                dbLogger.query(typeof text === 'string' ? text : text.text, params, duration);
            }
            return res;
        }).catch((err) => {
            dbLogger.error(err, typeof text === 'string' ? text : text.text);
            throw err;
        });
    }

    // If it's a callback based query
    return originalQuery.call(this, text, params, (err, res) => {
        const duration = Date.now() - start;
        if (err) {
            dbLogger.error(err, typeof text === 'string' ? text : text.text);
        } else if (process.env.NODE_ENV !== 'production') {
            dbLogger.query(typeof text === 'string' ? text : text.text, params, duration);
        }
        callback(err, res);
    });
};

const connectDB = async () => {
    try {
        const client = await pool.connect();
        logger.info("PostgreSQL connected successfully!");
        client.release();
    } catch (err) {
        logger.error("Error connecting to PostgreSQL", { error: err.message });
        throw err;
    }
};

export { pool };
export default connectDB;
