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

// Create MySQL connection pool
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: RPL_DB,
  ssl: {
    rejectUnauthorized: false,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

export default pool;
