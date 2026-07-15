import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: 'C:/Users/kotav/Downloads/irctc-app_1/irctc-app/server/.env' });

const { Pool } = pg;
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const q = "INSERT INTO auth_roles (code, name, description, is_system) VALUES ('PASSENGER', 'Passenger', 'Regular user with booking privileges', true) ON CONFLICT (code) DO NOTHING;";
pool.query(q)
  .then(() => { console.log('PASSENGER role added.'); process.exit(0); })
  .catch(console.error);
