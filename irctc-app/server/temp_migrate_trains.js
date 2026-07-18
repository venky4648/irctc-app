import { pool } from './shared/utils/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  try {
    console.log('Running migration...');
    await pool.query(`
      ALTER TABLE trains 
      ADD COLUMN IF NOT EXISTS running_days VARCHAR(255) DEFAULT 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
      ADD COLUMN IF NOT EXISTS coaches_json JSONB DEFAULT '[]'::jsonb;
    `);
    console.log('Migration successful: Added running_days and coaches_json columns to trains table.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
