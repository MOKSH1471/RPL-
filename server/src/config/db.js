import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const RPL_DB = (process.env.DB_NAME && process.env.DB_NAME.toLowerCase() !== 'aashray')
  ? process.env.DB_NAME
  : 'RPL';

export const AASHRAY_DB = process.env.AASHRAY_DB || 'aashray';

const isLocalHost = !process.env.DB_HOST || process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1';
const disableSsl = process.env.DB_SSL === 'false' || (isLocalHost && !process.env.DB_SSL);

// Create MySQL connection pool with keep-alive
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: RPL_DB,
  ssl: disableSsl ? undefined : {
    rejectUnauthorized: false,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  dateStrings: true,
});

export default pool;
