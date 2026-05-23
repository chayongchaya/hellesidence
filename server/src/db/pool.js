import pg from 'pg';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  (process.env.NODE_ENV === 'production'
    ? (() => { throw new Error('DATABASE_URL is required in production.'); })()
    : 'postgresql://root:root@localhost:15433/hellesidence_db');

export const pool = new pg.Pool({ connectionString });

pool.on('error', (err) => {
  logger.error('Database pool error', { message: err.message });
});
