import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
});

const connectDB = async () => {
    try {
        const client = await pool.connect();

        console.log(" PostgreSQL connected successfully!");

        client.release();
    } catch (err) {
        console.error(" Error connecting to PostgreSQL:");
        console.error(err);
    }
};

export { pool };
export default connectDB;